import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, MessageSquare, Plus, Trophy, Users } from "lucide-react";
import { communityApi } from "@/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard, PageHeader } from "@/components/layout/UserPage";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import CommunityComposer from "@/pages/community/CommunityComposer";
import CommunityFeed from "@/pages/community/CommunityFeed";
import CommunityFilters from "@/pages/community/CommunityFilters";
import CommunityLeaderboard from "@/pages/community/CommunityLeaderboard";
import CommunityRealtimeChat from "@/pages/community/CommunityRealtimeChat";
import CommunityChatRooms from "@/pages/community/CommunityChatRooms";
import { FriendAndPmMessenger } from "@/pages/community/FriendAndPmMessenger";
import { DEFAULT_CHAT_ROOMS, JLPT_OPTIONS } from "@/pages/community/constants";
import {
  ChatRoom,
  Comment,
  CommunityStats,
  LeaderboardEntry,
  PagedComments,
  PagedPosts,
  Post,
} from "@/pages/community/types";

const CHAT_ROOM_STORAGE_KEY = "yukihon.community.chat-room";

const normalizeRoomId = (roomId?: string | null) =>
  roomId?.trim().toLowerCase() || DEFAULT_CHAT_ROOMS[0]?.id || "general";

const Community = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [activeCategory, setActiveCategory] = useState("");
  const [jlptFilter, setJlptFilter] = useState<(typeof JLPT_OPTIONS)[number]>("ALL");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(() =>
    normalizeRoomId(localStorage.getItem(CHAT_ROOM_STORAGE_KEY))
  );

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("GENERAL");
  const [newJlptLevel, setNewJlptLevel] = useState("");
  const [newTags, setNewTags] = useState("");

  const [openComments, setOpenComments] = useState<number | null>(null);
  const [commentsByPost, setCommentsByPost] = useState<Record<number, Comment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [loadingComments, setLoadingComments] = useState(false);

  const postsKey = [
    "community",
    "posts",
    activeCategory,
    jlptFilter,
    appliedSearch,
    showBookmarkedOnly,
    page,
  ] as const;

  const postsQuery = useQuery({
    queryKey: postsKey,
    queryFn: async (): Promise<PagedPosts> =>
      (await communityApi.getPosts(page, 20, {
        category: activeCategory || undefined,
        jlptLevel: jlptFilter === "ALL" ? undefined : jlptFilter,
        search: appliedSearch.trim() || undefined,
        bookmarkedOnly: showBookmarkedOnly,
      })) as PagedPosts,
  });
  const posts = postsQuery.data?.content ?? [];
  const totalPages = postsQuery.data?.totalPages ?? 0;
  const loading = postsQuery.isLoading;

  useEffect(() => {
    if (postsQuery.error) {
      toast({
        title: "Khong tai duoc cong dong",
        description: "Vui long thu lai.",
        variant: "destructive",
      });
    }
  }, [postsQuery.error, toast]);

  const overviewQuery = useQuery({
    queryKey: ["community", "overview"],
    queryFn: async () => {
      const [statsData, leaderboardData] = await Promise.all([
        communityApi.getStats() as Promise<CommunityStats>,
        communityApi.getLeaderboard() as Promise<LeaderboardEntry[]>,
      ]);
      return { stats: statsData, leaderboard: leaderboardData };
    },
  });
  const stats = overviewQuery.data?.stats ?? null;
  const leaderboard = overviewQuery.data?.leaderboard ?? [];

  const chatRoomsQuery = useQuery({
    queryKey: ["community", "chat-rooms"],
    queryFn: async (): Promise<ChatRoom[]> => (await communityApi.getChatRooms()) as ChatRoom[],
  });
  const chatRooms =
    Array.isArray(chatRoomsQuery.data) && chatRoomsQuery.data.length > 0
      ? chatRoomsQuery.data
      : DEFAULT_CHAT_ROOMS;
  const chatRoomsLoading = chatRoomsQuery.isLoading;

  const patchPosts = (updater: (current: Post[]) => Post[]) =>
    queryClient.setQueryData<PagedPosts>(postsKey, (old) =>
      old ? { ...old, content: updater(old.content) } : old
    );

  useEffect(() => {
    if (!chatRooms.some((room) => room.id === selectedRoomId)) {
      setSelectedRoomId(chatRooms[0]?.id ?? DEFAULT_CHAT_ROOMS[0].id);
    }
  }, [chatRooms, selectedRoomId]);

  useEffect(() => {
    localStorage.setItem(CHAT_ROOM_STORAGE_KEY, selectedRoomId);
  }, [selectedRoomId]);

  const selectedChatRoom = useMemo(
    () =>
      chatRooms.find((room) => room.id === selectedRoomId) ?? chatRooms[0] ?? DEFAULT_CHAT_ROOMS[0],
    [chatRooms, selectedRoomId]
  );

  const createPostMutation = useMutation({
    mutationFn: () =>
      communityApi.createPost({
        title: newTitle.trim() || undefined,
        content: newContent,
        category: newCategory,
        jlptLevel: newJlptLevel || undefined,
        tags: newTags.trim() || undefined,
      }),
    onSuccess: () => {
      setNewTitle("");
      setNewContent("");
      setNewCategory("GENERAL");
      setNewJlptLevel("");
      setNewTags("");
      setShowCreatePost(false);
      setPage(0);
      queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
      queryClient.invalidateQueries({ queryKey: ["community", "overview"] });
      toast({ title: "Da dang bai", description: "Bai viet moi da xuat hien trong feed." });
    },
    onError: () => {
      toast({
        title: "Dang bai chua thanh cong",
        description: "Vui long thu lai.",
        variant: "destructive",
      });
    },
  });
  const posting = createPostMutation.isPending;

  const handleCreatePost = () => {
    if (!newContent.trim()) return;
    createPostMutation.mutate();
  };

  const likeMutation = useMutation({
    mutationFn: async (postId: number) => (await communityApi.toggleLike(postId)) as Post,
    onSuccess: (updated, postId) => {
      patchPosts((current) => current.map((post) => (post.id === postId ? updated : post)));
      queryClient.invalidateQueries({ queryKey: ["community", "overview"] });
    },
    onError: () => {
      toast({
        title: "Khong the tha tim",
        description: "Vui long thu lai.",
        variant: "destructive",
      });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (postId: number) => (await communityApi.toggleBookmark(postId)) as Post,
    onSuccess: (updated, postId) => {
      if (showBookmarkedOnly && !updated.bookmarkedByCurrentUser) {
        patchPosts((current) => current.filter((post) => post.id !== postId));
        if (posts.length === 1 && page > 0) {
          setPage((prev) => prev - 1);
        }
      } else {
        patchPosts((current) => current.map((post) => (post.id === postId ? updated : post)));
      }
    },
    onError: () => {
      toast({
        title: "Khong the bookmark",
        description: "Vui long thu lai.",
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: number) => communityApi.deletePost(postId),
    onSuccess: (_data, postId) => {
      patchPosts((current) => current.filter((post) => post.id !== postId));
      queryClient.invalidateQueries({ queryKey: ["community", "overview"] });
    },
    onError: () => {
      toast({
        title: "Khong the xoa bai viet",
        description: "Vui long thu lai.",
        variant: "destructive",
      });
    },
  });

  const loadComments = async (postId: number) => {
    if (openComments === postId) {
      setOpenComments(null);
      return;
    }

    setOpenComments(postId);
    setLoadingComments(true);
    try {
      const data = (await communityApi.getComments(postId)) as PagedComments;
      setCommentsByPost((prev) => ({ ...prev, [postId]: data.content }));
    } catch {
      toast({
        title: "Khong tai duoc binh luan",
        description: "Vui long thu lai.",
        variant: "destructive",
      });
    } finally {
      setLoadingComments(false);
    }
  };

  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) =>
      (await communityApi.addComment(postId, content)) as Comment,
    onSuccess: (newComment, { postId }) => {
      setCommentsByPost((prev) => ({ ...prev, [postId]: [newComment, ...(prev[postId] || [])] }));
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      patchPosts((current) =>
        current.map((post) =>
          post.id === postId ? { ...post, commentCount: post.commentCount + 1 } : post
        )
      );
      queryClient.invalidateQueries({ queryKey: ["community", "overview"] });
    },
    onError: () => {
      toast({
        title: "Khong gui duoc binh luan",
        description: "Vui long thu lai.",
        variant: "destructive",
      });
    },
  });

  const handleComment = (postId: number) => {
    const content = (commentInputs[postId] || "").trim();
    if (!content) return;
    commentMutation.mutate({ postId, content });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1480px]">
        <PageHeader
          icon={<Users className="h-6 w-6 text-pink-600" />}
          title="Community 2.0"
          description="Feed da co title, tags, bookmark, search, leaderboard va bo loc JLPT de cac cuoc tro chuyen huu ich hon."
          eyebrow="Community"
          action={
            <Button
              className="rounded-2xl bg-pink-500 text-white hover:bg-pink-400"
              onClick={() => setShowCreatePost((prev) => !prev)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Dang bai
            </Button>
          }
        />

        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <MetricCard
            hint="Tong bai viet"
            icon={<MessageSquare className="h-4 w-4 text-sky-500" />}
            label="Posts"
            value={stats?.totalPosts ?? posts.length}
          />
          <MetricCard
            hint="Binh luan toan cong dong"
            icon={<MessageCircle className="h-4 w-4 text-violet-500" />}
            label="Comments"
            value={stats?.totalComments ?? 0}
          />
          <MetricCard
            hint="Nguoi tham gia"
            icon={<Users className="h-4 w-4 text-emerald-500" />}
            label="Contributors"
            value={stats?.totalContributors ?? 0}
          />
          <MetricCard
            hint="Bai moi 7 ngay"
            icon={<Trophy className="h-4 w-4 text-amber-500" />}
            label="This week"
            value={stats?.postsThisWeek ?? 0}
          />
        </div>

        <div className="mb-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <CommunityFilters
            activeCategory={activeCategory}
            jlptFilter={jlptFilter}
            search={search}
            showBookmarkedOnly={showBookmarkedOnly}
            onActiveCategoryChange={(value) => {
              setActiveCategory(value);
              setPage(0);
            }}
            onJlptFilterChange={(value) => {
              setJlptFilter(value);
              setPage(0);
            }}
            onSearchChange={setSearch}
            onSearchSubmit={() => {
              setPage(0);
              if (search === appliedSearch) {
                void queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
              } else {
                setAppliedSearch(search);
              }
            }}
            onToggleBookmarked={() => {
              setShowBookmarkedOnly((prev) => !prev);
              setPage(0);
            }}
          />
          <div className="space-y-4">
            <CommunityLeaderboard leaderboard={leaderboard} stats={stats} />
            <CommunityChatRooms
              isLoading={chatRoomsLoading}
              onSelectRoom={(roomId) => setSelectedRoomId(normalizeRoomId(roomId))}
              rooms={chatRooms}
              selectedRoomId={selectedChatRoom.id}
            />
            <CommunityRealtimeChat
              currentUserId={user?.id}
              currentUserName={user?.displayName}
              room={selectedChatRoom}
            />
          </div>
        </div>

        <AnimatePresence>
          {showCreatePost ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: -10 }}
            >
              <CommunityComposer
                newTitle={newTitle}
                newContent={newContent}
                newCategory={newCategory}
                newJlptLevel={newJlptLevel}
                newTags={newTags}
                posting={posting}
                onTitleChange={setNewTitle}
                onContentChange={setNewContent}
                onCategoryChange={setNewCategory}
                onJlptLevelChange={(value) => setNewJlptLevel(value === "none" ? "" : value)}
                onTagsChange={setNewTags}
                onCancel={() => setShowCreatePost(false)}
                onSubmit={() => void handleCreatePost()}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <CommunityFeed
          loading={loading}
          posts={posts}
          showBookmarkedOnly={showBookmarkedOnly}
          openComments={openComments}
          commentsByPost={commentsByPost}
          commentInputs={commentInputs}
          loadingComments={loadingComments}
          currentUserId={user?.id}
          page={page}
          totalPages={totalPages}
          onLike={(postId) => likeMutation.mutate(postId)}
          onBookmark={(postId) => bookmarkMutation.mutate(postId)}
          onDeletePost={(postId) => deletePostMutation.mutate(postId)}
          onToggleComments={(postId) => void loadComments(postId)}
          onCommentInputChange={(postId, value) =>
            setCommentInputs((prev) => ({ ...prev, [postId]: value }))
          }
          onSubmitComment={(postId) => handleComment(postId)}
          onPageChange={(nextPage) => setPage(nextPage)}
        />
      </div>
      <FriendAndPmMessenger />
    </DashboardLayout>
  );
};

export default Community;
