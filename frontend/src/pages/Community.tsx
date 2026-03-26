import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Bookmark,
  Heart,
  HelpCircle,
  Lightbulb,
  MessageCircle,
  MessageSquare,
  Plus,
  Search,
  Send,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { communityApi } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: number;
  userId: number;
  userDisplayName: string;
  title?: string;
  content: string;
  category: string;
  jlptLevel?: string;
  likeCount: number;
  commentCount: number;
  imageUrl?: string;
  likedByCurrentUser: boolean;
  bookmarkedByCurrentUser: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: number;
  postId: number;
  userId: number;
  userDisplayName: string;
  content: string;
  createdAt: string;
}

interface PagedPosts {
  content: Post[];
  totalPages: number;
  number: number;
}

interface PagedComments {
  content: Comment[];
  totalPages: number;
}

interface CommunityStats {
  totalPosts: number;
  totalComments: number;
  totalContributors: number;
  postsThisWeek: number;
  questionsCount: number;
  resourcesCount: number;
  trendingTags: string[];
}

interface LeaderboardEntry {
  userId: number;
  userDisplayName: string;
  postsCount: number;
  commentsCount: number;
  likesReceived: number;
  score: number;
}

const CATEGORIES = [
  { value: "", label: "Tat ca", icon: Users, tone: "border-border bg-white text-foreground/80" },
  { value: "GENERAL", label: "Tong hop", icon: MessageSquare, tone: "border-sky-200 bg-sky-50 text-sky-700" },
  { value: "QUESTION", label: "Hoi dap", icon: HelpCircle, tone: "border-amber-200 bg-amber-50 text-amber-700" },
  { value: "TIP", label: "Meo hoc", icon: Lightbulb, tone: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { value: "RESOURCE", label: "Tai lieu", icon: BookOpen, tone: "border-violet-200 bg-violet-50 text-violet-700" },
  { value: "ACHIEVEMENT", label: "Thanh tich", icon: Award, tone: "border-rose-200 bg-rose-50 text-rose-700" },
];

const JLPT_OPTIONS = ["ALL", "N5", "N4", "N3", "N2", "N1"] as const;

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

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
          search: search.trim() || undefined,
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
    [activeCategory, jlptFilter, search, showBookmarkedOnly, toast]
  );

  useEffect(() => {
    void fetchPosts(0);
  }, [fetchPosts]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const visiblePosts = useMemo(() => posts, [posts]);

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
      setPosts((prev) => prev.map((post) => (post.id === postId ? updated : post)));
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
          <PageSection title="Bo loc thong minh" description="Tim bai theo topic, JLPT, tu khoa va bookmark ma khong can roi khoi feed.">
            <div className="space-y-3">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-11 rounded-2xl border-border bg-card pl-11 text-foreground placeholder:text-muted-foreground"
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void fetchPosts(0)}
                    placeholder="Tim theo title, noi dung, hoac tag"
                    value={search}
                  />
                </div>

                <Select value={jlptFilter} onValueChange={(value) => setJlptFilter(value as (typeof JLPT_OPTIONS)[number])}>
                  <SelectTrigger className="h-11 rounded-2xl border-border bg-card text-foreground/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JLPT_OPTIONS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button className="h-11 rounded-2xl" onClick={() => void fetchPosts(0)}>
                  <Search className="mr-2 h-4 w-4" />
                  Tim
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  const active = activeCategory === category.value;
                  return (
                    <button
                      key={category.label}
                      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                        active ? category.tone : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}
                      onClick={() => setActiveCategory(category.value)}
                      type="button"
                    >
                      <Icon className="h-4 w-4" />
                      {category.label}
                    </button>
                  );
                })}

                <button
                  className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                    showBookmarkedOnly ? "border-amber-200 bg-amber-50 text-amber-700" : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setShowBookmarkedOnly((prev) => !prev)}
                  type="button"
                >
                  <Bookmark className="h-4 w-4" />
                  Bookmarked
                </button>
              </div>
            </div>
          </PageSection>

          <PageSection title="Leaderboard" description="Xep hang nho de nhin nhanh ai dang tao gia tri cho cong dong.">
            <div className="space-y-3">
              {leaderboard.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chua du du lieu de xep hang.</p>
              ) : (
                leaderboard.map((entry, index) => (
                  <div key={entry.userId} className="rounded-[18px] border border-border bg-card p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          #{index + 1} {entry.userDisplayName}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {entry.postsCount} posts • {entry.commentsCount} comments • {entry.likesReceived} likes received
                        </p>
                      </div>
                      <Badge className="rounded-full border border-pink-200 bg-pink-50 text-pink-700">
                        {entry.score} pts
                      </Badge>
                    </div>
                  </div>
                ))
              )}

              {stats?.trendingTags?.length ? (
                <div className="pt-2">
                  <p className="mb-2 text-sm font-medium text-foreground">Trending tags</p>
                  <div className="flex flex-wrap gap-2">
                    {stats.trendingTags.map((tag) => (
                      <span key={tag} className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </PageSection>
        </div>

        <AnimatePresence>
          {showCreatePost && (
            <motion.div animate={{ opacity: 1, y: 0 }} className="mb-4" exit={{ opacity: 0, y: -10 }} initial={{ opacity: 0, y: -10 }}>
              <PageSection title="Tao bai viet moi" description="Them title va tags de feed co cau truc hon va de tim lai hon.">
                <div className="space-y-3">
                  <Input
                    className="h-11 rounded-2xl border-border bg-card text-foreground placeholder:text-muted-foreground"
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Title ngan gon cho bai viet"
                    value={newTitle}
                  />
                  <Textarea
                    className="min-h-[140px] rounded-[20px] border-border bg-card text-foreground placeholder:text-muted-foreground"
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Ban dang muon chia se dieu gi ve viec hoc tieng Nhat?"
                    value={newContent}
                  />
                  <div className="grid gap-3 md:grid-cols-4">
                    <Select onValueChange={setNewCategory} value={newCategory}>
                      <SelectTrigger className="h-11 rounded-2xl border-border bg-card text-foreground/80">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.filter((item) => item.value).map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select onValueChange={setNewJlptLevel} value={newJlptLevel || "none"}>
                      <SelectTrigger className="h-11 rounded-2xl border-border bg-card text-foreground/80">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Khong JLPT</SelectItem>
                        {["N5", "N4", "N3", "N2", "N1"].map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      className="h-11 rounded-2xl border-border bg-card text-foreground placeholder:text-muted-foreground"
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="tag1, tag2, tag3"
                      value={newTags}
                    />

                    <div className="flex gap-2">
                      <Button className="flex-1 rounded-2xl border-border bg-white text-muted-foreground" onClick={() => setShowCreatePost(false)} variant="outline">
                        Huy
                      </Button>
                      <Button
                        className="flex-1 rounded-2xl bg-pink-500 text-white hover:bg-pink-400"
                        disabled={posting || !newContent.trim()}
                        onClick={() => void handleCreatePost()}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Dang
                      </Button>
                    </div>
                  </div>
                </div>
              </PageSection>
            </motion.div>
          )}
        </AnimatePresence>

        <PageSection title="Bang tin" description="Feed da co title, tags va bookmark nen de scan nhanh va luu lai bai hay hon.">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 rounded-full border-4 border-pink-100 border-t-pink-500 animate-spin" />
            </div>
          ) : visiblePosts.length === 0 ? (
            <EmptyState
              description={showBookmarkedOnly ? "Ban chua bookmark bai viet nao trong trang hien tai." : "Hay la nguoi dau tien mo mot cuoc tro chuyen moi."}
              icon={<MessageSquare className="h-6 w-6" />}
              title="Chua co bai viet"
            />
          ) : (
            <div className="space-y-3">
              {visiblePosts.map((post) => {
                const category = CATEGORIES.find((item) => item.value === post.category) || CATEGORIES[0];
                const Icon = category.icon;
                const comments = commentsByPost[post.id] || [];

                return (
                  <div key={post.id} className="rounded-[22px] border border-white bg-card p-4 shadow-[0_10px_24px_rgba(148,163,184,0.10)]">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f9a8d4,#c4b5fd)] text-sm font-semibold text-foreground">
                          {post.userDisplayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{post.userDisplayName}</p>
                          <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)} truoc</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Badge className={`rounded-full border ${category.tone}`}>
                          <Icon className="mr-1 h-3.5 w-3.5" />
                          {category.label}
                        </Badge>
                        {post.jlptLevel && (
                          <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-700">{post.jlptLevel}</Badge>
                        )}
                        {user?.id === post.userId && (
                          <Button className="h-8 w-8 rounded-xl" onClick={() => void handleDeletePost(post.id)} size="icon" variant="ghost">
                            <Trash2 className="h-4 w-4 text-rose-500" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {post.title ? <h3 className="mb-2 text-lg font-semibold text-foreground">{post.title}</h3> : null}
                    <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/80">{post.content}</p>

                    {post.tags?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span key={`${post.id}-${tag}`} className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-4 flex items-center gap-2 border-t border-border/80 pt-3">
                      <Button
                        className={post.likedByCurrentUser ? "rounded-xl bg-pink-50 text-pink-700 hover:bg-pink-100" : "rounded-xl text-muted-foreground hover:text-pink-600"}
                        onClick={() => void handleLike(post.id)}
                        size="sm"
                        variant="ghost"
                      >
                        <Heart className={`mr-1 h-4 w-4 ${post.likedByCurrentUser ? "fill-pink-500 text-pink-500" : ""}`} />
                        {post.likeCount}
                      </Button>
                      <Button className="rounded-xl text-muted-foreground hover:text-foreground" onClick={() => void loadComments(post.id)} size="sm" variant="ghost">
                        <MessageCircle className="mr-1 h-4 w-4" />
                        {post.commentCount}
                      </Button>
                      <Button
                        className={post.bookmarkedByCurrentUser ? "rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100" : "rounded-xl text-muted-foreground hover:text-amber-600"}
                        onClick={() => void handleBookmark(post.id)}
                        size="sm"
                        variant="ghost"
                      >
                        <Bookmark className={`mr-1 h-4 w-4 ${post.bookmarkedByCurrentUser ? "fill-amber-500 text-amber-500" : ""}`} />
                        Luu
                      </Button>
                    </div>

                    <AnimatePresence>
                      {openComments === post.id && (
                        <motion.div animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} initial={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="mt-4 space-y-3 border-t border-border/80 pt-3">
                            <div className="flex gap-2">
                              <Input
                                className="h-10 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground"
                                onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                                onKeyDown={(e) => e.key === "Enter" && void handleComment(post.id)}
                                placeholder="Viet binh luan..."
                                value={commentInputs[post.id] || ""}
                              />
                              <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" disabled={!(commentInputs[post.id] || "").trim()} onClick={() => void handleComment(post.id)} size="icon">
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>

                            {loadingComments ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="h-10 w-10 rounded-full border-4 border-sky-100 border-t-sky-500 animate-spin" />
                              </div>
                            ) : comments.length === 0 ? (
                              <p className="text-sm text-muted-foreground">Chua co binh luan nao.</p>
                            ) : (
                              comments.map((comment) => (
                                <div key={comment.id} className="rounded-[18px] border border-border bg-muted/40 p-3">
                                  <div className="mb-1 flex items-center gap-2">
                                    <span className="text-sm font-semibold text-foreground">{comment.userDisplayName}</span>
                                    <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)} truoc</span>
                                  </div>
                                  <p className="text-sm text-foreground/80">{comment.content}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {totalPages > 1 && !showBookmarkedOnly && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button className="rounded-xl" disabled={page === 0} onClick={() => void fetchPosts(page - 1)} size="sm" variant="outline">
                    Truoc
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {page + 1} / {totalPages}
                  </span>
                  <Button className="rounded-xl" disabled={page >= totalPages - 1} onClick={() => void fetchPosts(page + 1)} size="sm" variant="outline">
                    Sau
                  </Button>
                </div>
              )}
            </div>
          )}
        </PageSection>
      </div>
    </DashboardLayout>
  );
};

export default Community;
