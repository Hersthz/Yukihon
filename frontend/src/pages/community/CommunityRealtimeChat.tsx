import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Radio, RefreshCcw, SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRealtimeChat } from "@/hooks/community/useRealtimeChat";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CommunityRealtimeChatProps {
  currentUserId?: number;
  roomId?: string;
}

const statusLabelMap = {
  connected: "Connected",
  connecting: "Connecting",
  disconnected: "Disconnected",
  error: "Error",
} as const;

const CommunityRealtimeChat = ({ currentUserId, roomId = "general" }: CommunityRealtimeChatProps) => {
  const { toast } = useToast();
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  const { messages, connectionState, isLoadingHistory, connectionError, reconnect, sendMessage } = useRealtimeChat({
    roomId,
    enabled: true,
  });

  useEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }

    list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

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
  };

  return (
    <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg font-semibold text-slate-900">Real-time Lounge</CardTitle>
          <div className="flex items-center gap-2">
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
              return (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[92%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                    isMe ? "ml-auto bg-sky-500 text-white" : "bg-white text-slate-800"
                  )}
                >
                  <div className={cn("mb-1 flex items-center gap-2 text-[11px]", isMe ? "text-sky-100" : "text-slate-500")}>
                    <Radio className="h-3 w-3" />
                    <span className="font-semibold">{message.userDisplayName}</span>
                    <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                </div>
              );
            })
          )}
        </div>

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
            placeholder="Nhap tin nhan va nhan Enter..."
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
