import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, UserPlus, Users, Check, X, Search, Loader2, UserX } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  friendApi,
  privateChatApi,
  type UserConnection,
  type ConnectionStatus,
  type PrivateMessage,
} from "@/api";
import { usePrivateChat } from "@/hooks/community/usePrivateChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const FriendAndPmMessenger = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const [selectedFriendName, setSelectedFriendName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const enabled = open && !!user;
  const friendsQuery = useQuery({
    queryKey: ["friends", "list"],
    queryFn: () => friendApi.getFriends(),
    enabled,
  });
  const pendingQuery = useQuery({
    queryKey: ["friends", "pending"],
    queryFn: () => friendApi.getPendingRequests(),
    enabled,
  });
  const friends: UserConnection[] = friendsQuery.data ?? [];
  const pending: UserConnection[] = pendingQuery.data ?? [];

  const searchQuery = useQuery({
    queryKey: ["friends", "search", debouncedTerm],
    queryFn: () => friendApi.search(debouncedTerm),
    enabled: enabled && debouncedTerm.length >= 2,
  });
  const results = searchQuery.data ?? [];

  const unreadQuery = useQuery({
    queryKey: ["private-chat", "unread"],
    queryFn: () => privateChatApi.getUnread(),
    enabled: !!user,
    refetchInterval: 15000,
  });
  const unreadTotal = unreadQuery.data?.total ?? 0;
  const unreadFor = (userId?: number) =>
    (unreadQuery.data?.perUser ?? []).find((u) => u.userId === userId)?.count ?? 0;

  const invalidateFriends = () => {
    void queryClient.invalidateQueries({ queryKey: ["friends"] });
  };

  const onMutationError = (title: string) => (e: unknown) =>
    toast({
      title,
      description: e instanceof Error ? e.message : "Lỗi",
      variant: "destructive",
    });

  const sendRequestMutation = useMutation({
    mutationFn: (receiverId: number) => friendApi.sendRequest(receiverId),
    onSuccess: () => {
      toast({ title: "Đã gửi lời mời kết bạn" });
      invalidateFriends();
    },
    onError: onMutationError("Gửi lời mời thất bại"),
  });

  const acceptMutation = useMutation({
    mutationFn: (id: number) => friendApi.acceptRequest(id),
    onSuccess: invalidateFriends,
    onError: onMutationError("Chấp nhận thất bại"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => friendApi.removeConnection(id),
    onSuccess: invalidateFriends,
    onError: onMutationError("Thao tác thất bại"),
  });

  const handleAccept = (id: number) => acceptMutation.mutate(id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg" size="icon">
          <MessageSquare className="h-6 w-6" />
          {unreadTotal > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white">
              {unreadTotal > 99 ? "99+" : unreadTotal}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Friends & Messages</DialogTitle>
          <DialogDescription className="sr-only">
            Messaging and friends management
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="friends" className="flex-1 flex flex-col">
          <div className="px-4 pt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="friends">
                <Users className="w-4 h-4 mr-2" /> Friends
              </TabsTrigger>
              <TabsTrigger value="chat" disabled={!selectedFriendId}>
                <MessageSquare className="w-4 h-4 mr-2" /> Chat
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="friends" className="flex-1 flex flex-col m-0 overflow-hidden">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">Tìm bạn bè</h4>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Tìm theo tên hoặc email…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  {debouncedTerm.length >= 2 && (
                    <div className="mt-2 space-y-2">
                      {searchQuery.isLoading ? (
                        <div className="flex justify-center py-3">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : results.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Không tìm thấy người dùng.</p>
                      ) : (
                        results.map((r) => {
                          const ru = r.user;
                          if (!ru?.id) return null;
                          const busy =
                            (sendRequestMutation.isPending &&
                              sendRequestMutation.variables === ru.id) ||
                            (acceptMutation.isPending &&
                              acceptMutation.variables === r.connectionId) ||
                            (removeMutation.isPending &&
                              removeMutation.variables === r.connectionId);
                          return (
                            <div
                              key={ru.id}
                              className="flex items-center justify-between gap-2 p-2 rounded-lg border bg-card"
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  {ru.avatarUrl && <AvatarImage src={ru.avatarUrl} alt="" />}
                                  <AvatarFallback>{(ru.displayName || "?")[0]}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">{ru.displayName}</p>
                                  <p className="truncate text-xs text-muted-foreground">
                                    {ru.email}
                                  </p>
                                </div>
                              </div>
                              {r.status === "FRIENDS" ? (
                                <span className="shrink-0 text-xs font-medium text-emerald-600">
                                  Bạn bè
                                </span>
                              ) : r.status === "PENDING" && r.incoming ? (
                                <Button
                                  size="sm"
                                  disabled={busy}
                                  onClick={() => r.connectionId && handleAccept(r.connectionId)}
                                >
                                  Chấp nhận
                                </Button>
                              ) : r.status === "PENDING" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={busy}
                                  onClick={() =>
                                    r.connectionId && removeMutation.mutate(r.connectionId)
                                  }
                                >
                                  Huỷ lời mời
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  disabled={busy}
                                  onClick={() => sendRequestMutation.mutate(ru.id!)}
                                >
                                  {busy ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <UserPlus className="mr-1 h-4 w-4" /> Kết bạn
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {pending.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">
                      Lời mời đang chờ ({pending.length})
                    </h4>
                    <div className="space-y-2">
                      {pending.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-2 p-2 rounded-lg border bg-card"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <Avatar className="h-8 w-8">
                              {p.requester.avatarUrl && (
                                <AvatarImage src={p.requester.avatarUrl} alt="" />
                              )}
                              <AvatarFallback>{p.requester.displayName[0]}</AvatarFallback>
                            </Avatar>
                            <span className="truncate text-sm font-medium">
                              {p.requester.displayName}
                            </span>
                          </div>
                          <div className="flex shrink-0 gap-1.5">
                            <Button
                              size="sm"
                              disabled={acceptMutation.isPending || removeMutation.isPending}
                              onClick={() => handleAccept(p.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={acceptMutation.isPending || removeMutation.isPending}
                              onClick={() => removeMutation.mutate(p.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-sm mb-2">Bạn bè ({friends.length})</h4>
                  <div className="space-y-2">
                    {friends.length === 0 && (
                      <p className="text-xs text-muted-foreground">Chưa có bạn bè nào.</p>
                    )}
                    {friends.map((f) => {
                      const friendUser = f.requester.id === user?.id ? f.receiver : f.requester;
                      return (
                        <div
                          key={f.id}
                          className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedFriendId(friendUser.id);
                            setSelectedFriendName(friendUser.displayName);
                            const el = document.querySelector('[data-value="chat"]') as HTMLElement;
                            if (el) el.click();
                          }}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar className="h-8 w-8">
                              {friendUser.avatarUrl && (
                                <AvatarImage src={friendUser.avatarUrl} alt="" />
                              )}
                              <AvatarFallback>{friendUser.displayName[0]}</AvatarFallback>
                            </Avatar>
                            <span className="truncate text-sm font-medium">
                              {friendUser.displayName}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            {unreadFor(friendUser.id) > 0 && (
                              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white">
                                {unreadFor(friendUser.id)}
                              </span>
                            )}
                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                              title="Huỷ kết bạn"
                              disabled={removeMutation.isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeMutation.mutate(f.id);
                              }}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent
            value="chat"
            className="flex-1 flex flex-col m-0 p-0 overflow-hidden outline-none"
          >
            {selectedFriendId ? (
              <PrivateChatView
                currentUserId={user?.id}
                otherUserId={selectedFriendId}
                otherUserName={selectedFriendName}
              />
            ) : (
              <div className="flex p-4 flex-col items-center justify-center h-full text-muted-foreground text-sm">
                Select a friend to start chatting
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export const PrivateChatView = ({
  currentUserId,
  otherUserId,
  otherUserName,
}: {
  currentUserId?: number;
  otherUserId: number;
  otherUserName: string;
}) => {
  const [inputText, setInputText] = useState("");
  const queryClient = useQueryClient();
  const { messages, sendMessage, otherUserTyping, sendTyping, connectionState } = usePrivateChat({
    currentUserId,
    otherUserId,
    enabled: true,
  });

  // Mark the conversation read whenever the newest message is from the other user.
  const lastMessage = messages[messages.length - 1];
  useEffect(() => {
    if (!lastMessage || lastMessage.sender.id === currentUserId) return;
    void privateChatApi.markRead(otherUserId).then(() => {
      void queryClient.invalidateQueries({ queryKey: ["private-chat", "unread"] });
    });
  }, [lastMessage, currentUserId, otherUserId, queryClient]);

  // "Seen" = my most recent sent message has been read by the other user.
  const myLastSent = [...messages].reverse().find((m) => m.sender.id === currentUserId);
  const seen = !!myLastSent?.read;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText("");
    sendTyping(false);
  };

  const handleType = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    sendTyping(e.target.value.length > 0);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-3 border-b bg-muted/20 flex items-center justify-between">
        <span className="font-semibold text-sm">{otherUserName}</span>
        <span
          className={`w-2 h-2 rounded-full ${connectionState === "connected" ? "bg-green-500" : "bg-red-500"}`}
        />
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col justify-end space-y-3 min-h-full">
          {messages.map((m) => {
            const isMe = m.sender.id === currentUserId;
            return (
              <div key={m.id} className={`flex max-w-[80%] ${isMe ? "self-end" : "self-start"}`}>
                <div
                  className={`rounded-xl px-3 py-2 text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}
          {seen && !otherUserTyping && (
            <div className="self-end text-[11px] text-muted-foreground">Đã xem</div>
          )}
          {otherUserTyping && (
            <div className="text-xs text-muted-foreground animate-pulse">
              {otherUserName} đang nhập…
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t bg-card">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={inputText}
            onChange={handleType}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!inputText.trim() || connectionState !== "connected"}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};
