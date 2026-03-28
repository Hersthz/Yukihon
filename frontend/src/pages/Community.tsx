import { useCallback, useEffect, useState } from "react";
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
import { JLPT_OPTIONS } from "@/pages/community/constants";
import { Comment, CommunityStats, LeaderboardEntry, PagedComments, PagedPosts, Post } from "@/pages/community/types";

const Community = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeCategory, setActiveCategory] = useState("");
  const [jlptFilter, setJlptFilter] = useState<(typeof JLPT_OPTIONS)[number]>("ALL");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("GENERAL");
  const [newJlptLevel, setNewJlptLevel] = useState("");
  const [newTags, setNewTags] = useState("");
  const [posting, setPosting] = useState(false);

  const [openComments, setOpenComments] = useState<number | null>(null);
  const [commentsByPost, setCommentsByPost] = useState<Record<number, Comment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [loadingComments, setLoadingComments] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const [statsData, leaderboardData] = await Promise.all([
        communityApi.getStats() as Promise<CommunityStats>,
        communityApi.getLeaderboard() as Promise<LeaderboardEntry[]>,
      ]);
      setStats(statsData);
      setLeaderboard(leaderboardData);
    } catch {
      // keep page usable if stats fail
    }
  }, []);

  const fetchPosts = useCallback(
    async (pageNum = 0) => {
      try {
        setLoading(true);
        const data = (await communityApi.getPosts(pageNum, 20, {
          category: activeCategory || undefined,
          jlptLevel: jlptFilter === "ALL" ? undefined : jlptFilter,
          search: appliedSearch.trim() || undefined,
          bookmarkedOnly: showBookmarkedOnly,
        })) as PagedPosts;

        setPosts(data.content);
        setTotalPages(data.totalPages);
        setPage(data.number);
      } catch {
        toast({ title: "Khong tai duoc cong dong", description: "Vui long thu lai.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    },
    [activeCategory, appliedSearch, jlptFilter, showBookmarkedOnly, toast]
  );

  useEffect(() => {
    void fetchPosts(0);
  }, [fetchPosts]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const handleCreatePost = async () => {
    if (!newContent.trim()) return;

    setPosting(true);
    try {
      await communityApi.createPost({
        title: newTitle.trim() || undefined,
        content: newContent,
        category: newCategory,
        jlptLevel: newJlptLevel || undefined,
        tags: newTags.trim() || undefined,
      });

      setNewTitle("");
      setNewContent("");
      setNewCategory("GENERAL");
      setNewJlptLevel("");
      setNewTags("");
      setShowCreatePost(false);

      await Promise.all([fetchPosts(0), fetchStats()]);
      toast({ title: "Da dang bai", description: "Bai viet moi da xuat hien trong feed." });
    } catch {
      toast({ title: "Dang bai chua thanh cong", description: "Vui long thu lai.", variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const updated = (await communityApi.toggleLike(postId)) as Post;
      setPosts((prev) => prev.map((post) => (post.id === postId ? updated : post)));
      await fetchStats();
    } catch {
      toast({ title: "Khong the tha tim", description: "Vui long thu lai.", variant: "destructive" });
    }
  };

  const handleBookmark = async (postId: number) => {
    try {
      const updated = (await communityApi.toggleBookmark(postId)) as Post;

      if (showBookmarkedOnly && !updated.bookmarkedByCurrentUser) {
        setPosts((prev) => prev.filter((post) => post.id !== postId));
        if (posts.length === 1 && page > 0) {
          await fetchPosts(page - 1);
        }
      } else {
        setPosts((prev) => prev.map((post) => (post.id === postId ? updated : post)));
      }
    } catch {
      toast({ title: "Khong the bookmark", description: "Vui long thu lai.", variant: "destructive" });
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await communityApi.deletePost(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      await fetchStats();
    } catch {
      toast({ title: "Khong the xoa bai viet", description: "Vui long thu lai.", variant: "destructive" });
    }
  };

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
      toast({ title: "Khong tai duoc binh luan", description: "Vui long thu lai.", variant: "destructive" });
    } finally {
      setLoadingComments(false);
    }
  };

  const handleComment = async (postId: number) => {
    const content = (commentInputs[postId] || "").trim();
    if (!content) return;

    try {
      const newComment = (await communityApi.addComment(postId, content)) as Comment;
      setCommentsByPost((prev) => ({ ...prev, [postId]: [newComment, ...(prev[postId] || [])] }));
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, commentCount: post.commentCount + 1 } : post))
      );
      await fetchStats();
    } catch {
      toast({ title: "Khong gui duoc binh luan", description: "Vui long thu lai.", variant: "destructive" });
    }
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
            <Button className="rounded-2xl bg-pink-500 text-white hover:bg-pink-400" onClick={() => setShowCreatePost((prev) => !prev)}>
              <Plus className="mr-2 h-4 w-4" />
              Dang bai
            </Button>
          }
        />

        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <MetricCard hint="Tong bai viet" icon={<MessageSquare className="h-4 w-4 text-sky-500" />} label="Posts" value={stats?.totalPosts ?? posts.length} />
          <MetricCard hint="Binh luan toan cong dong" icon={<MessageCircle className="h-4 w-4 text-violet-500" />} label="Comments" value={stats?.totalComments ?? 0} />
          <MetricCard hint="Nguoi tham gia" icon={<Users className="h-4 w-4 text-emerald-500" />} label="Contributors" value={stats?.totalContributors ?? 0} />
          <MetricCard hint="Bai moi 7 ngay" icon={<Trophy className="h-4 w-4 text-amber-500" />} label="This week" value={stats?.postsThisWeek ?? 0} />
        </div>

        <div className="mb-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <CommunityFilters
            activeCategory={activeCategory}
            jlptFilter={jlptFilter}
            search={search}
            showBookmarkedOnly={showBookmarkedOnly}
            onActiveCategoryChange={setActiveCategory}
            onJlptFilterChange={setJlptFilter}
            onSearchChange={setSearch}
            onSearchSubmit={() => {
              if (search === appliedSearch) {
                void fetchPosts(0);
                return;
              }
              setAppliedSearch(search);
            }}
            onToggleBookmarked={() => setShowBookmarkedOnly((prev) => !prev)}
          />
          <CommunityLeaderboard leaderboard={leaderboard} stats={stats} />
        </div>

        <AnimatePresence>
          {showCreatePost ? (
            <motion.div animate={{ opacity: 1, y: 0 }} className="mb-4" exit={{ opacity: 0, y: -10 }} initial={{ opacity: 0, y: -10 }}>
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
          onLike={(postId) => void handleLike(postId)}
          onBookmark={(postId) => void handleBookmark(postId)}
          onDeletePost={(postId) => void handleDeletePost(postId)}
          onToggleComments={(postId) => void loadComments(postId)}
          onCommentInputChange={(postId, value) => setCommentInputs((prev) => ({ ...prev, [postId]: value }))}
          onSubmitComment={(postId) => void handleComment(postId)}
          onPageChange={(nextPage) => void fetchPosts(nextPage)}
        />
      </div>
    </DashboardLayout>
  );
};

export default Community;
