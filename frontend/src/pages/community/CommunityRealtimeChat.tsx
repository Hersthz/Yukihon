import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Radio, RefreshCcw, RotateCcw, SendHorizontal, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRealtimeChat } from "@/hooks/community/useRealtimeChat";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { ChatRoom } from "@/pages/community/types";

interface CommunityRealtimeChatProps {
  currentUserId?: number;
  currentUserName?: string;
  room: ChatRoom;
}

const statusLabelMap = {
  connected: "Connected",
  connecting: "Connecting",
  disconnected: "Disconnected",
  error: "Error",
} as const;

const CommunityRealtimeChat = ({ currentUserId, currentUserName, room }: CommunityRealtimeChatProps) => {
  const { toast } = useToast();
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const lastSocketErrorRef = useRef<string | null>(null);

  const {
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
    retryMessage,
    sendTyping,
    activeUsers,
    activeDisplayNames,
  } = useRealtimeChat({
    roomId: room.id,
    enabled: true,
    currentUserId,
    currentUserName,
    trackUnread: true,
  });

  useEffect(() => {
    setDraft("");
    lastSocketErrorRef.current = null;
  }, [room.id]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }

    const distanceFromBottom = list.scrollHeight - list.scrollTop - list.clientHeight;
    const shouldStickToBottom = distanceFromBottom < 80;

    if (shouldStickToBottom) {
      list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
    }
  }, [messages.length]);

  useEffect(() => {
    const clearUnreadWhenActive = () => {
      if (document.visibilityState === "visible") {
        markRead();
      }
    };

    clearUnreadWhenActive();
    window.addEventListener("focus", clearUnreadWhenActive);
    document.addEventListener("visibilitychange", clearUnreadWhenActive);
    return () => {
      window.removeEventListener("focus", clearUnreadWhenActive);
      document.removeEventListener("visibilitychange", clearUnreadWhenActive);
    };
  }, [markRead]);

  useEffect(() => {
    if (!lastSocketError) {
      return;
    }

    const errorKey = `${lastSocketError.code}:${lastSocketError.createdAt}`;
    if (lastSocketErrorRef.current === errorKey) {
      return;
    }

    lastSocketErrorRef.current = errorKey;

    const description =
      lastSocketError.code === "RATE_LIMIT"
        ? "Ban dang gui qua nhanh. Thu lai sau vai giay."
        : lastSocketError.code === "MODERATION"
          ? "Tin nhan co tu khoa bi chan. Vui long dieu chinh noi dung."
          : lastSocketError.message;

    toast({
      title: "Khong gui duoc tin nhan",
      description,
      variant: "destructive",
    });
  }, [lastSocketError, toast]);

  useEffect(() => {
    const hasDraft = draft.trim().length > 0;
    const timeoutId = setTimeout(() => {
      sendTyping(hasDraft);
    }, 250);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [draft, sendTyping]);

  useEffect(() => {
    return () => {
      sendTyping(false);
    };
  }, [sendTyping]);

  const statusClassName = useMemo(() => {
    if (connectionState === "connected") {
      return "text-emerald-700 bg-emerald-100";
    }
    if (connectionState === "connecting") {
      return "text-amber-700 bg-amber-100";
    }
    return "text-rose-700 bg-rose-100";
  }, [connectionState]);

  const handleSend = () => {
    if (!draft.trim()) {
      return;
    }

    const sent = sendMessage(draft);
    if (!sent) {
      toast({
        title: "Khong gui duoc tin nhan",
        description: "Chat chua ket noi. Thu reconnect roi gui lai.",
        variant: "destructive",
      });
      return;
    }

    setDraft("");
    sendTyping(false);
  };

  const typingLabel = useMemo(() => {
    if (typingUsers.length === 0) {
      return null;
    }

    if (typingUsers.length === 1) {
      return `${typingUsers[0]} dang go...`;
    }

    if (typingUsers.length === 2) {
      return `${typingUsers[0]} va ${typingUsers[1]} dang go...`;
    }

    return `${typingUsers[0]} va ${typingUsers.length - 1} nguoi khac dang go...`;
  }, [typingUsers]);

  return (
    <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">{room.title} room</CardTitle>
              <p className="mt-1 text-xs text-slate-500">{room.description}</p>
            </div>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-sky-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                {unreadCount > 99 ? "99+" : unreadCount} unread
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 sm:inline-flex">
              <Users className="h-3.5 w-3.5" />
              {activeUsers} online
            </span>
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", statusClassName)}>
              {statusLabelMap[connectionState]}
            </span>
            <Button
              className="h-8 rounded-xl"
              onClick={reconnect}
              size="sm"
              type="button"
              variant="outline"
            >
              <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />
              Reconnect
            </Button>
          </div>
        </div>
        {connectionError ? <p className="text-xs text-rose-600">{connectionError}</p> : null}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">{room.focus}</span>
          <span>Room id: #{room.id}</span>
        </div>
        {activeDisplayNames.length > 0 ? (
          <p className="text-xs text-slate-500">
            Dang trong phong: {activeDisplayNames.join(", ")}
          </p>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-3">
        <div ref={listRef} className="h-[280px] space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
          {isLoadingHistory ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Dang tai lich su chat...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">Chua co tin nhan nao trong phong.</div>
          ) : (
            messages.map((message) => {
              const isMe = currentUserId != null && message.userId === currentUserId;
              const isSending = message.deliveryState === "sending";
              const isFailed = message.deliveryState === "failed";
              return (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[92%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                    isMe
                      ? isFailed
                        ? "ml-auto border border-rose-200 bg-rose-50 text-rose-900"
                        : "ml-auto bg-sky-500 text-white"
                      : "bg-white text-slate-800"
                  )}
                >
                  <div className={cn("mb-1 flex items-center gap-2 text-[11px]", isMe ? (isFailed ? "text-rose-700" : "text-sky-100") : "text-slate-500")}>
                    {isSending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Radio className="h-3 w-3" />}
                    <span className="font-semibold">{message.userDisplayName}</span>
                    <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                  {isMe ? (
                    <div className={cn("mt-2 flex items-center justify-end gap-2 text-[11px]", isFailed ? "text-rose-700" : "text-sky-100")}>
                      {isSending ? <span>Dang gui...</span> : null}
                      {isFailed ? (
                        <>
                          <span>Gui that bai</span>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 font-semibold"
                            onClick={() => {
                              const retried = retryMessage(message.id);
                              if (!retried) {
                                toast({
                                  title: "Khong retry duoc tin nhan",
                                  description: "Chat chua ket noi. Thu reconnect roi gui lai.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <RotateCcw className="h-3 w-3" />
                            Thu lai
                          </button>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        {typingLabel ? <p className="px-1 text-xs font-medium text-sky-600">{typingLabel}</p> : null}

        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
        >
          <Input
            maxLength={1000}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={`Nhan tin trong phong ${room.title}...`}
            value={draft}
          />
          <Button className="rounded-xl" disabled={!draft.trim()} type="submit">
            <SendHorizontal className="mr-1.5 h-4 w-4" />
            Gui
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CommunityRealtimeChat;
