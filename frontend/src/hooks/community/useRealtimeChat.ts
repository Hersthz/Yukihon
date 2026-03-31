import { Client, type IMessage } from "@stomp/stompjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SockJS from "sockjs-client";

import { communityApi } from "@/api";
import apiClient from "@/lib/apiClient";
import type { ChatMessage, ChatSocketError, ChatTypingEvent } from "@/pages/community/types";

type ConnectionState = "connecting" | "connected" | "disconnected" | "error";

interface UseRealtimeChatOptions {
  roomId?: string;
  enabled?: boolean;
  currentUserId?: number;
  loadHistory?: boolean;
  trackUnread?: boolean;
}

const HISTORY_LIMIT = 50;
const MAX_MESSAGE_CACHE = 200;
const TYPING_TTL_MS = 3500;

const parseMessage = (raw: unknown): ChatMessage | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Partial<ChatMessage>;
  if (
    typeof candidate.id !== "number" ||
    typeof candidate.roomId !== "string" ||
    typeof candidate.userId !== "number" ||
    typeof candidate.userDisplayName !== "string" ||
    typeof candidate.content !== "string" ||
    typeof candidate.createdAt !== "string"
  ) {
    return null;
  }

  return candidate as ChatMessage;
};

const parseTypingEvent = (raw: unknown): ChatTypingEvent | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Partial<ChatTypingEvent>;
  if (
    typeof candidate.roomId !== "string" ||
    typeof candidate.userId !== "number" ||
    typeof candidate.userDisplayName !== "string" ||
    typeof candidate.typing !== "boolean" ||
    typeof candidate.createdAt !== "string"
  ) {
    return null;
  }

  return candidate as ChatTypingEvent;
};

const parseSocketError = (raw: unknown): ChatSocketError | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Partial<ChatSocketError>;
  if (
    typeof candidate.code !== "string" ||
    typeof candidate.message !== "string" ||
    typeof candidate.createdAt !== "string"
  ) {
    return null;
  }

  if (!["RATE_LIMIT", "MODERATION", "UNAUTHORIZED", "VALIDATION"].includes(candidate.code)) {
    return null;
  }

  return candidate as ChatSocketError;
};

const appendUniqueMessage = (messages: ChatMessage[], message: ChatMessage): ChatMessage[] => {
  if (messages.some((item) => item.id === message.id)) {
    return messages;
  }

  const next = [...messages, message];
  return next.length > MAX_MESSAGE_CACHE ? next.slice(next.length - MAX_MESSAGE_CACHE) : next;
};

export const useRealtimeChat = ({
  roomId = "general",
  enabled = true,
  currentUserId,
  loadHistory = true,
  trackUnread = false,
}: UseRealtimeChatOptions = {}) => {
  const normalizedRoomId = useMemo(() => roomId.trim().toLowerCase() || "general", [roomId]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastSocketError, setLastSocketError] = useState<ChatSocketError | null>(null);
  const [sessionNonce, setSessionNonce] = useState(0);

  const clientRef = useRef<Client | null>(null);
  const typingUsersRef = useRef<Map<number, string>>(new Map());
  const typingTimeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const updateTypingUsers = useCallback(() => {
    setTypingUsers(Array.from(typingUsersRef.current.values()));
  }, []);

  const clearTypingUser = useCallback(
    (userId: number) => {
      const timeoutId = typingTimeoutsRef.current.get(userId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        typingTimeoutsRef.current.delete(userId);
      }

      if (typingUsersRef.current.delete(userId)) {
        updateTypingUsers();
      }
    },
    [updateTypingUsers]
  );

  const handleIncomingMessage = useCallback((frame: IMessage) => {
    try {
      const parsed = parseMessage(JSON.parse(frame.body));
      if (!parsed) {
        return;
      }

      setMessages((prev) => appendUniqueMessage(prev, parsed));

      if (trackUnread && parsed.userId !== currentUserId) {
        const shouldIncrementUnread = document.hidden || !document.hasFocus();
        if (shouldIncrementUnread) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    } catch {
      // Ignore malformed payloads to keep chat resilient.
    }
  }, [currentUserId, trackUnread]);

  const handleIncomingTyping = useCallback(
    (frame: IMessage) => {
      try {
        const parsed = parseTypingEvent(JSON.parse(frame.body));
        if (!parsed || parsed.roomId !== normalizedRoomId) {
          return;
        }

        if (parsed.userId === currentUserId) {
          return;
        }

        if (parsed.typing) {
          typingUsersRef.current.set(parsed.userId, parsed.userDisplayName);
          updateTypingUsers();

          const existingTimeout = typingTimeoutsRef.current.get(parsed.userId);
          if (existingTimeout) {
            clearTimeout(existingTimeout);
          }

          const timeoutId = setTimeout(() => clearTypingUser(parsed.userId), TYPING_TTL_MS);
          typingTimeoutsRef.current.set(parsed.userId, timeoutId);
          return;
        }

        clearTypingUser(parsed.userId);
      } catch {
        // Ignore malformed typing payloads.
      }
    },
    [clearTypingUser, currentUserId, normalizedRoomId, updateTypingUsers]
  );

  const handleSocketError = useCallback((frame: IMessage) => {
    try {
      const parsed = parseSocketError(JSON.parse(frame.body));
      if (!parsed) {
        return;
      }

      setLastSocketError(parsed);
    } catch {
      // Ignore malformed error payloads.
    }
  }, []);

  const reconnect = useCallback(() => {
    setSessionNonce((prev) => prev + 1);
  }, []);

  const markRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setConnectionState("disconnected");
      setTypingUsers([]);
      return;
    }

    let isActive = true;
    const token = localStorage.getItem("yukihon_token");

    const loadChatHistory = async () => {
      if (!loadHistory) {
        setMessages([]);
        return;
      }

      setIsLoadingHistory(true);
      try {
        const history = (await communityApi.getChatMessages(normalizedRoomId, HISTORY_LIMIT)) as ChatMessage[];
        if (!isActive) {
          return;
        }

        const safeHistory = history
          .map((item) => parseMessage(item))
          .filter((item): item is ChatMessage => item !== null);
        setMessages(safeHistory);
      } catch {
        if (isActive) {
          setConnectionError("Khong tai duoc lich su chat");
        }
      } finally {
        if (isActive) {
          setIsLoadingHistory(false);
        }
      }
    };

    void loadChatHistory();

    if (!token) {
      setConnectionState("disconnected");
      setConnectionError("Ban can dang nhap de dung chat real-time");
      return () => {
        isActive = false;
      };
    }

    setConnectionError(null);
    setConnectionState("connecting");
  setLastSocketError(null);

    const socketUrl = `${apiClient.baseURL}/ws-community-chat`;
    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        if (!isActive) {
          return;
        }

        setConnectionState("connected");
        client.subscribe(`/topic/community-chat.${normalizedRoomId}`, handleIncomingMessage);
        client.subscribe(`/topic/community-chat.typing.${normalizedRoomId}`, handleIncomingTyping);
        client.subscribe("/user/queue/community-chat.errors", handleSocketError);
      },
      onStompError: (frame) => {
        if (!isActive) {
          return;
        }

        setConnectionState("error");
        setConnectionError(frame.headers["message"] || "Ket noi chat gap loi");
      },
      onWebSocketClose: () => {
        if (isActive) {
          setConnectionState("disconnected");
        }
      },
    });

    clientRef.current = client;
    client.activate();

    const typingTimeouts = typingTimeoutsRef.current;
    const typingUsersMap = typingUsersRef.current;

    return () => {
      isActive = false;
      setConnectionState("disconnected");
      typingTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      typingTimeouts.clear();
      typingUsersMap.clear();
      setTypingUsers([]);
      void client.deactivate();
      if (clientRef.current === client) {
        clientRef.current = null;
      }
    };
  }, [enabled, handleIncomingMessage, handleIncomingTyping, handleSocketError, loadHistory, normalizedRoomId, sessionNonce]);

  const sendMessage = useCallback(
    (content: string) => {
      const trimmedContent = content.trim();
      const client = clientRef.current;

      if (!trimmedContent || !client || !client.connected) {
        return false;
      }

      setLastSocketError(null);

      client.publish({
        destination: "/app/community-chat.send",
        body: JSON.stringify({ roomId: normalizedRoomId, content: trimmedContent }),
      });

      return true;
    },
    [normalizedRoomId]
  );

  const sendTyping = useCallback(
    (typing: boolean) => {
      const client = clientRef.current;
      if (!client || !client.connected) {
        return;
      }

      client.publish({
        destination: "/app/community-chat.typing",
        body: JSON.stringify({ roomId: normalizedRoomId, typing }),
      });
    },
    [normalizedRoomId]
  );

  return {
    messages,
    typingUsers,
    unreadCount,
    lastSocketError,
    connectionState,
    isLoadingHistory,
    connectionError,
    reconnect,
    markRead,
    sendMessage,
    sendTyping,
  };
};
