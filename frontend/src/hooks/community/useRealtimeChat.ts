import { Client, type IMessage } from "@stomp/stompjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SockJS from "sockjs-client";

import { communityApi } from "@/api";
import apiClient from "@/lib/apiClient";
import type { ChatMessage } from "@/pages/community/types";

type ConnectionState = "connecting" | "connected" | "disconnected" | "error";

interface UseRealtimeChatOptions {
  roomId?: string;
  enabled?: boolean;
}

const HISTORY_LIMIT = 50;
const MAX_MESSAGE_CACHE = 200;

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

const appendUniqueMessage = (messages: ChatMessage[], message: ChatMessage): ChatMessage[] => {
  if (messages.some((item) => item.id === message.id)) {
    return messages;
  }

  const next = [...messages, message];
  return next.length > MAX_MESSAGE_CACHE ? next.slice(next.length - MAX_MESSAGE_CACHE) : next;
};

export const useRealtimeChat = ({ roomId = "general", enabled = true }: UseRealtimeChatOptions = {}) => {
  const normalizedRoomId = useMemo(() => roomId.trim().toLowerCase() || "general", [roomId]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [sessionNonce, setSessionNonce] = useState(0);

  const clientRef = useRef<Client | null>(null);

  const handleIncomingMessage = useCallback((frame: IMessage) => {
    try {
      const parsed = parseMessage(JSON.parse(frame.body));
      if (!parsed) {
        return;
      }

      setMessages((prev) => appendUniqueMessage(prev, parsed));
    } catch {
      // Ignore malformed payloads to keep chat resilient.
    }
  }, []);

  const reconnect = useCallback(() => {
    setSessionNonce((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setConnectionState("disconnected");
      return;
    }

    let isActive = true;
    const token = localStorage.getItem("yukihon_token");

    const loadHistory = async () => {
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

    void loadHistory();

    if (!token) {
      setConnectionState("disconnected");
      setConnectionError("Ban can dang nhap de dung chat real-time");
      return () => {
        isActive = false;
      };
    }

    setConnectionError(null);
    setConnectionState("connecting");

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

    return () => {
      isActive = false;
      setConnectionState("disconnected");
      void client.deactivate();
      if (clientRef.current === client) {
        clientRef.current = null;
      }
    };
  }, [enabled, handleIncomingMessage, normalizedRoomId, sessionNonce]);

  const sendMessage = useCallback(
    (content: string) => {
      const trimmedContent = content.trim();
      const client = clientRef.current;

      if (!trimmedContent || !client || !client.connected) {
        return false;
      }

      client.publish({
        destination: "/app/community-chat.send",
        body: JSON.stringify({ roomId: normalizedRoomId, content: trimmedContent }),
      });

      return true;
    },
    [normalizedRoomId]
  );

  return {
    messages,
    connectionState,
    isLoadingHistory,
    connectionError,
    reconnect,
    sendMessage,
  };
};
