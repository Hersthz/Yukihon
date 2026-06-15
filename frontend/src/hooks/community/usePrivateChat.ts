import { Client, type IMessage } from "@stomp/stompjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SockJS from "sockjs-client";
import apiClient from "@/lib/apiClient";
import { privateChatApi, type PrivateMessage } from "@/api";

type ConnectionState = "connecting" | "connected" | "disconnected" | "error";

interface UsePrivateChatOptions {
  otherUserId?: number;
  currentUserId?: number;
  enabled?: boolean;
  loadHistory?: boolean;
}

const parseMessage = (raw: unknown): PrivateMessage | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const candidate = raw as Partial<PrivateMessage>;
  if (
    typeof candidate.id !== "number" ||
    typeof candidate.content !== "string"
  ) {
    return null;
  }
  return candidate as PrivateMessage;
};

const createSockJsInstance = (url: string) => {
  const candidate = SockJS as unknown;
  if (typeof candidate === "function") {
    try {
      return new (candidate as new (socketUrl: string) => WebSocket)(url);
    } catch {
      return (candidate as (socketUrl: string) => WebSocket)(url);
    }
  }
  if (typeof candidate === "object" && candidate !== null && "default" in candidate) {
    const defaultExport = (candidate as { default: unknown }).default;
    if (typeof defaultExport === "function") {
      try {
        return new (defaultExport as new (socketUrl: string) => WebSocket)(url);
      } catch {
        return (defaultExport as (socketUrl: string) => WebSocket)(url);
      }
    }
  }
  throw new Error("SockJS constructor is unavailable");
};

export function usePrivateChat(options: UsePrivateChatOptions = {}) {
  const {
    otherUserId,
    currentUserId,
    enabled = true,
    loadHistory = true,
  } = options;

  const stompClientRef = useRef<Client | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Typing
  const [isTyping, setIsTyping] = useState(false);

  // Auto connect and load history
  useEffect(() => {
    if (!enabled || !currentUserId || !otherUserId) {
      return;
    }

    if (loadHistory) {
      setHistoryLoading(true);
      privateChatApi.getHistory(otherUserId, 0, 50)
        .then(page => {
           // Page comes back sorted desc (newest first). Let's reverse before setting to array pushing
          const reversed = [...page.content].reverse();
          setMessages(reversed);
          setHasMoreHistory(page.number < page.totalPages - 1);
          setCurrentPage(0);
        })
        .finally(() => setHistoryLoading(false));
    }
  }, [enabled, currentUserId, otherUserId, loadHistory]);

  const loadMoreHistory = useCallback(async () => {
     if (!otherUserId || historyLoading || !hasMoreHistory) return;
     try {
       setHistoryLoading(true);
       const nextPage = currentPage + 1;
       const page = await privateChatApi.getHistory(otherUserId, nextPage, 50);
       const reversed = [...page.content].reverse();
       setMessages(prev => [...reversed, ...prev]);
       setHasMoreHistory(page.number < page.totalPages - 1);
       setCurrentPage(nextPage);
     } finally {
       setHistoryLoading(false);
     }
  }, [otherUserId, currentPage, historyLoading, hasMoreHistory]);

  // Connect STOMP
  useEffect(() => {
    if (!enabled || !currentUserId || !otherUserId) {
      if (stompClientRef.current?.active) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
        setConnectionState("disconnected");
      }
      return;
    }

    const socketUrl = `${apiClient.baseURL}/ws-community-chat`;
    const token = apiClient.getToken() || "";
    
    // Using STOMP
    const client = new Client({
      webSocketFactory: () => createSockJsInstance(socketUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      reconnectDelay: 2000,
      heartbeatIncoming: 20000,
      heartbeatOutgoing: 20000,
      debug: (str) => {
        // console.log("[Private STOMP]", str);
      },
    });

    client.onConnect = () => {
      setConnectionState("connected");
      // Subscribe to private messages queue
      client.subscribe("/user/queue/private", (message: IMessage) => {
        try {
          const body = JSON.parse(message.body);
          const parsed = parseMessage(body);
          if (parsed && (parsed.sender.id === otherUserId || parsed.receiver.id === otherUserId)) {
             setMessages(prev => [...prev, parsed]);
          }
        } catch(e) {}
      });
      
      // typing
      client.subscribe("/user/queue/private-typing", (message: IMessage) => {
        try {
          const body = JSON.parse(message.body);
          if (body.senderId === otherUserId) {
            setIsTyping(body.typing);
          }
        } catch(e) {}
      });
    };

    client.onStompError = (frame) => {
      setConnectionState("error");
    };

    client.onWebSocketError = () => {
      setConnectionState("error");
    };
    
    client.onDisconnect = () => {
      setConnectionState("disconnected");
    };

    setConnectionState("connecting");
    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [enabled, currentUserId, otherUserId]);

  const sendMessage = useCallback((content: string) => {
    if (!stompClientRef.current?.active || !otherUserId) return;
    
    stompClientRef.current.publish({
      destination: "/app/private-chat.send",
      body: JSON.stringify({
        receiverId: otherUserId,
        content
      })
    });
  }, [otherUserId]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!stompClientRef.current?.active || !otherUserId) return;
    
    stompClientRef.current.publish({
      destination: "/app/private-chat.typing",
      body: JSON.stringify({
        receiverId: otherUserId,
        typing: isTyping
      })
    });
  }, [otherUserId]);

  return {
    connectionState,
    messages,
    historyLoading,
    hasMoreHistory,
    loadMoreHistory,
    sendMessage,
    sendTyping,
    otherUserTyping: isTyping
  };
}
