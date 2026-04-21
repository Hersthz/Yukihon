import { Client, type IMessage } from "@stomp/stompjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SockJS from "sockjs-client";

import { communityApi } from "@/api";
import apiClient from "@/lib/apiClient";
import type { ChatMessage, ChatPresence, ChatSocketError, ChatTypingEvent } from "@/pages/community/types";

type ConnectionState = "connecting" | "connected" | "disconnected" | "error";

interface UseRealtimeChatOptions {
  roomId?: string;
  enabled?: boolean;
  currentUserId?: number;
  currentUserName?: string;
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

  return {
    ...candidate,
    clientMessageId: typeof candidate.clientMessageId === "string" ? candidate.clientMessageId : null,
    deliveryState: "sent",
  } as ChatMessage;
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

  return {
    ...candidate,
    clientMessageId: typeof candidate.clientMessageId === "string" ? candidate.clientMessageId : null,
  } as ChatSocketError;
};

const parsePresence = (raw: unknown): ChatPresence | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Partial<ChatPresence>;
  if (
    typeof candidate.roomId !== "string" ||
    typeof candidate.activeUsers !== "number" ||
    !Array.isArray(candidate.activeDisplayNames) ||
    typeof candidate.createdAt !== "string"
  ) {
    return null;
  }

  const safeNames = candidate.activeDisplayNames.filter((item): item is string => typeof item === "string");
  return { ...candidate, activeDisplayNames: safeNames } as ChatPresence;
};

const sortMessages = (messages: ChatMessage[]) =>
  [...messages].sort((left, right) => {
    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();
    if (leftTime !== rightTime) {
      return leftTime - rightTime;
    }

    return String(left.id).localeCompare(String(right.id));
  });

const upsertMessage = (messages: ChatMessage[], incoming: ChatMessage): ChatMessage[] => {
  const next = [...messages];
  const matchIndex = next.findIndex((item) => {
    if (typeof incoming.id === "number" && item.id === incoming.id) {
      return true;
    }

    if (incoming.clientMessageId && item.clientMessageId && incoming.clientMessageId === item.clientMessageId) {
      return true;
    }

    return false;
  });

  if (matchIndex >= 0) {
    next[matchIndex] = {
      ...next[matchIndex],
      ...incoming,
      deliveryState: incoming.deliveryState ?? "sent",
    };
  } else {
    next.push(incoming);
  }

  const limited = sortMessages(next);
  return limited.length > MAX_MESSAGE_CACHE ? limited.slice(limited.length - MAX_MESSAGE_CACHE) : limited;
};

const mergeHistory = (current: ChatMessage[], history: ChatMessage[]) =>
  history.reduce((accumulator, item) => upsertMessage(accumulator, item), current);

const createOptimisticMessage = ({
  roomId,
  userId,
  userDisplayName,
  content,
  clientMessageId,
}: {
  roomId: string;
  userId?: number;
  userDisplayName?: string;
  content: string;
  clientMessageId: string;
}): ChatMessage => ({
  id: `local-${clientMessageId}`,
  roomId,
  userId: userId ?? -1,
  userDisplayName: userDisplayName || "You",
  clientMessageId,
  content,
  createdAt: new Date().toISOString(),
  deliveryState: "sending",
});

const createClientMessageId = () =>
  `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const createSockJsInstance = (url: string) => {
  const candidate = SockJS as unknown;

  if (typeof candidate === "function") {
    try {
      return new (candidate as new (socketUrl: string) => WebSocket)(url);
    } catch {
      return (candidate as (socketUrl: string) => WebSocket)(url);
    }
  }

  throw new Error("SockJS constructor is unavailable");
};

export const useRealtimeChat = ({
  roomId = "general",
  enabled = true,
  currentUserId,
  currentUserName,
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
  const [presence, setPresence] = useState<ChatPresence | null>(null);

  const clientRef = useRef<Client | null>(null);
  const activeRoomIdRef = useRef(normalizedRoomId);
  const typingUsersRef = useRef<Map<number, string>>(new Map());
  const typingTimeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const lastSentTypingStateRef = useRef<boolean>(false);

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

  const markMessageFailed = useCallback((clientMessageId?: string | null) => {
    setMessages((prev) =>
      prev.map((item) => {
        const shouldMarkFailed = clientMessageId
          ? item.clientMessageId === clientMessageId
          : item.deliveryState === "sending";

        return shouldMarkFailed ? { ...item, deliveryState: "failed" } : item;
      })
    );
  }, []);

  const handleIncomingMessage = useCallback((frame: IMessage) => {
    try {
      const parsed = parseMessage(JSON.parse(frame.body));
      if (!parsed || parsed.roomId !== activeRoomIdRef.current) {
        return;
      }

      setMessages((prev) => upsertMessage(prev, parsed));

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
        if (!parsed || parsed.roomId !== activeRoomIdRef.current || parsed.userId === currentUserId) {
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
    [clearTypingUser, currentUserId, updateTypingUsers]
  );

  const handleSocketError = useCallback((frame: IMessage) => {
    try {
      const parsed = parseSocketError(JSON.parse(frame.body));
      if (!parsed) {
        return;
      }

      setLastSocketError(parsed);
      markMessageFailed(parsed.clientMessageId);
    } catch {
      // Ignore malformed error payloads.
    }
  }, [markMessageFailed]);

  const handlePresence = useCallback((frame: IMessage) => {
    try {
      const parsed = parsePresence(JSON.parse(frame.body));
      if (!parsed || parsed.roomId !== activeRoomIdRef.current) {
        return;
      }

      setPresence(parsed);
    } catch {
      // Ignore malformed presence payloads.
    }
  }, []);

  const reconnect = useCallback(() => {
    setSessionNonce((prev) => prev + 1);
  }, []);

  const markRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    activeRoomIdRef.current = normalizedRoomId;
    lastSentTypingStateRef.current = false;
    setMessages([]);
    setTypingUsers([]);
    setUnreadCount(0);
    setLastSocketError(null);
    setPresence(null);
    setConnectionError(null);

    typingTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    typingTimeoutsRef.current.clear();
    typingUsersRef.current.clear();
  }, [normalizedRoomId]);

  useEffect(() => {
    if (!enabled) {
      setConnectionState("disconnected");
      setTypingUsers([]);
      setPresence(null);
      return;
    }

    let isActive = true;
    const token = localStorage.getItem("yukihon_token");

    const loadChatHistory = async () => {
      if (!loadHistory) {
        setMessages((prev) => prev.filter((item) => item.deliveryState !== "sent"));
        return;
      }

      setIsLoadingHistory(true);
      try {
        const history = (await communityApi.getChatMessages(normalizedRoomId, HISTORY_LIMIT)) as ChatMessage[];
        if (!isActive || activeRoomIdRef.current !== normalizedRoomId) {
          return;
        }

        const safeHistory = history.map((item) => parseMessage(item)).filter((item): item is ChatMessage => item !== null);
        setMessages((prev) => mergeHistory(prev, safeHistory.filter((item) => item.roomId === activeRoomIdRef.current)));
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
    setPresence(null);

    const socketUrl = `${apiClient.baseURL}/ws-community-chat`;
    const client = new Client({
      webSocketFactory: () => createSockJsInstance(socketUrl),
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
        setConnectionError(null);
        client.subscribe(`/topic/community-chat.${normalizedRoomId}`, handleIncomingMessage);
        client.subscribe(`/topic/community-chat.typing.${normalizedRoomId}`, handleIncomingTyping);
        client.subscribe(`/topic/community-chat.presence.${normalizedRoomId}`, handlePresence);
        client.subscribe("/user/queue/community-chat.errors", handleSocketError);
      },
      onStompError: (frame) => {
        if (!isActive) {
          return;
        }

        setConnectionState("error");
        setConnectionError(frame.headers.message || "Ket noi chat gap loi");
      },
      onWebSocketClose: () => {
        if (isActive) {
          setConnectionState("disconnected");
        }
      },
    });

    clientRef.current = client;
    try {
      client.activate();
    } catch {
      setConnectionState("error");
      setConnectionError("Khong the khoi tao ket noi chat");
      return () => {
        isActive = false;
      };
    }

    const typingTimeouts = typingTimeoutsRef.current;
    const typingUsersMap = typingUsersRef.current;

    return () => {
      isActive = false;
      setConnectionState("disconnected");
      lastSentTypingStateRef.current = false;
      typingTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      typingTimeouts.clear();
      typingUsersMap.clear();
      setTypingUsers([]);
      void client.deactivate();
      if (clientRef.current === client) {
        clientRef.current = null;
      }
    };
  }, [enabled, handleIncomingMessage, handleIncomingTyping, handlePresence, handleSocketError, loadHistory, normalizedRoomId, sessionNonce]);

  const publishRawMessage = useCallback((content: string, existingClientMessageId?: string) => {
    const trimmedContent = content.trim();
    const client = clientRef.current;

    if (!trimmedContent || !client || !client.connected) {
      return false;
    }

    const clientMessageId = existingClientMessageId || createClientMessageId();

    setLastSocketError(null);
    setMessages((prev) =>
      upsertMessage(
        prev.filter((item) => !(item.clientMessageId === clientMessageId && item.deliveryState === "failed")),
        createOptimisticMessage({
          roomId: normalizedRoomId,
          userId: currentUserId,
          userDisplayName: currentUserName,
          content: trimmedContent,
          clientMessageId,
        })
      )
    );

    client.publish({
      destination: "/app/community-chat.send",
      body: JSON.stringify({ roomId: normalizedRoomId, content: trimmedContent, clientMessageId }),
    });

    return true;
  }, [currentUserId, currentUserName, normalizedRoomId]);

  const sendMessage = useCallback((content: string) => publishRawMessage(content), [publishRawMessage]);

  const retryMessage = useCallback((messageId: ChatMessage["id"]) => {
    const targetMessage = messages.find((item) => item.id === messageId);
    if (!targetMessage) {
      return false;
    }

    return publishRawMessage(targetMessage.content);
  }, [messages, publishRawMessage]);

  const sendTyping = useCallback(
    (typing: boolean) => {
      const client = clientRef.current;
      if (!client || !client.connected || lastSentTypingStateRef.current === typing) {
        return;
      }

      lastSentTypingStateRef.current = typing;
      client.publish({
        destination: "/app/community-chat.typing",
        body: JSON.stringify({ roomId: normalizedRoomId, typing }),
      });
    },
    [normalizedRoomId]
  );

  const activeDisplayNames = presence?.activeDisplayNames ?? [];
  const activeUsers = presence?.activeUsers ?? 0;

  return {
    messages,
    typingUsers,
    unreadCount,
    lastSocketError,
    connectionState,
    isLoadingHistory,
    connectionError,
    presence,
    activeUsers,
    activeDisplayNames,
    reconnect,
    markRead,
    sendMessage,
    retryMessage,
    sendTyping,
  };
};
