import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Check, Loader2, MessageSquare, Search, UserPlus, UserX, Users, X } from "lucide-react";

import { friendApi, privateChatApi, type UserConnection } from "@/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/UserPage";
import { PrivateChatView } from "@/pages/community/FriendAndPmMessenger";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const selectedFriendId = params.get("with") ? Number(params.get("with")) : null;

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const friendsQuery = useQuery({
    queryKey: ["friends", "list"],
    queryFn: () => friendApi.getFriends(),
    enabled: !!user,
  });
  const pendingQuery = useQuery({
    queryKey: ["friends", "pending"],
    queryFn: () => friendApi.getPendingRequests(),
    enabled: !!user,
  });
  const searchQuery = useQuery({
    queryKey: ["friends", "search", debouncedTerm],
    queryFn: () => friendApi.search(debouncedTerm),
    enabled: !!user && debouncedTerm.length >= 2,
  });
  const unreadQuery = useQuery({
    queryKey: ["private-chat", "unread"],
    queryFn: () => privateChatApi.getUnread(),
    enabled: !!user,
    refetchInterval: 15000,
  });

  const friends: UserConnection[] = friendsQuery.data ?? [];
  const pending: UserConnection[] = pendingQuery.data ?? [];
  const results = searchQuery.data ?? [];
  const unreadFor = (id?: number) =>
    (unreadQuery.data?.perUser ?? []).find((u) => u.userId === id)?.count ?? 0;

  const invalidateFriends = () => queryClient.invalidateQueries({ queryKey: ["friends"] });
  const onError = (title: string) => (e: unknown) =>
    toast({ title, description: e instanceof Error ? e.message : "Lỗi", variant: "destructive" });

  const sendRequest = useMutation({
    mutationFn: (receiverId: number) => friendApi.sendRequest(receiverId),
    onSuccess: () => {
      toast({ title: "Đã gửi lời mời kết bạn" });
      void invalidateFriends();
    },
    onError: onError("Gửi lời mời thất bại"),
  });
  const accept = useMutation({
    mutationFn: (id: number) => friendApi.acceptRequest(id),
    onSuccess: () => void invalidateFriends(),
    onError: onError("Chấp nhận thất bại"),
  });
  const remove = useMutation({
    mutationFn: (id: number) => friendApi.removeConnection(id),
    onSuccess: () => void invalidateFriends(),
    onError: onError("Thao tác thất bại"),
  });

  const selectFriend = (id: number) => setParams({ with: String(id) }, { replace: true });

  const selectedFriend = friends
    .map((f) => (f.requester.id === user?.id ? f.receiver : f.requester))
    .find((u) => u.id === selectedFriendId);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1100px]">
        <PageHeader
          icon={<MessageSquare className="h-5 w-5 text-primary" />}
          eyebrow="Kết nối"
          title="Bạn bè & Tin nhắn"
          description="Tìm bạn, quản lý lời mời và trò chuyện riêng tư — tất cả ở một nơi."
        />

        <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
          {/* Left: friends & search */}
          <div className="rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm bạn theo tên hoặc email…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <ScrollArea className="h-[62vh]">
              <div className="space-y-4 p-3">
                {debouncedTerm.length >= 2 && (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Kết quả tìm kiếm
                    </h4>
                    <div className="space-y-2">
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
                          return (
                            <div
                              key={ru.id}
                              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background p-2"
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
                                  onClick={() => r.connectionId && accept.mutate(r.connectionId)}
                                >
                                  Chấp nhận
                                </Button>
                              ) : r.status === "PENDING" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => r.connectionId && remove.mutate(r.connectionId)}
                                >
                                  Huỷ lời mời
                                </Button>
                              ) : (
                                <Button size="sm" onClick={() => sendRequest.mutate(ru.id!)}>
                                  <UserPlus className="mr-1 h-4 w-4" /> Kết bạn
                                </Button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {pending.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Lời mời đang chờ ({pending.length})
                    </h4>
                    <div className="space-y-2">
                      {pending.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background p-2"
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
                            <Button size="sm" onClick={() => accept.mutate(p.id)}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => remove.mutate(p.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Bạn bè ({friends.length})
                  </h4>
                  <div className="space-y-1.5">
                    {friendsQuery.isLoading ? (
                      <div className="flex justify-center py-3">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : friends.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Chưa có bạn bè nào.</p>
                    ) : (
                      friends.map((f) => {
                        const fu = f.requester.id === user?.id ? f.receiver : f.requester;
                        const unread = unreadFor(fu.id);
                        const active = fu.id === selectedFriendId;
                        return (
                          <div
                            key={f.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => fu.id && selectFriend(fu.id)}
                            className={cn(
                              "group flex cursor-pointer items-center justify-between gap-2 rounded-lg border p-2 transition-colors",
                              active
                                ? "border-primary bg-primary/5"
                                : "border-transparent hover:bg-muted/50"
                            )}
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <Avatar className="h-9 w-9">
                                {fu.avatarUrl && <AvatarImage src={fu.avatarUrl} alt="" />}
                                <AvatarFallback>{fu.displayName[0]}</AvatarFallback>
                              </Avatar>
                              <span className="truncate text-sm font-medium">{fu.displayName}</span>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              {unread > 0 && (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white">
                                  {unread}
                                </span>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity hover:text-rose-600 group-hover:opacity-100"
                                title="Huỷ kết bạn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  remove.mutate(f.id);
                                }}
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Right: chat pane */}
          <div className="h-[70vh] overflow-hidden rounded-2xl border border-border bg-card">
            {selectedFriendId && selectedFriend ? (
              <PrivateChatView
                currentUserId={user?.id}
                otherUserId={selectedFriendId}
                otherUserName={selectedFriend.displayName ?? "Bạn"}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                <Users className="h-10 w-10 opacity-40" />
                <p className="text-sm">Chọn một người bạn để bắt đầu trò chuyện.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
