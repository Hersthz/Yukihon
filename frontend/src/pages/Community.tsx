import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Heart,
  HelpCircle,
  Lightbulb,
  MessageCircle,
  MessageSquare,
  Plus,
  Send,
  Trash2,
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
  content: string;
  category: string;
  jlptLevel: string;
  likeCount: number;
  commentCount: number;
  imageUrl: string;
  likedByCurrentUser: boolean;
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

const CATEGORIES = [
  { value: "", label: "Tất cả", icon: Users, tone: "border-slate-200 bg-white text-slate-700" },
  { value: "GENERAL", label: "Tổng hợp", icon: MessageSquare, tone: "border-sky-200 bg-sky-50 text-sky-700" },
  { value: "QUESTION", label: "Hỏi đáp", icon: HelpCircle, tone: "border-amber-200 bg-amber-50 text-amber-700" },
  { value: "TIP", label: "Mẹo học", icon: Lightbulb, tone: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { value: "RESOURCE", label: "Tài liệu", icon: BookOpen, tone: "border-violet-200 bg-violet-50 text-violet-700" },
  { value: "ACHIEVEMENT", label: "Thành tích", icon: Award, tone: "border-rose-200 bg-rose-50 text-rose-700" },
];

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
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("GENERAL");
  const [newJlptLevel, setNewJlptLevel] = useState("");
  const [posting, setPosting] = useState(false);
  const [openComments, setOpenComments] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const fetchPosts = useCallback(
    async (pageNum = 0, category?: string) => {
      try {
        setLoading(true);
        const data = (await communityApi.getPosts(pageNum, 20, category || undefined)) as PagedPosts;
        setPosts(data.content);
        setTotalPages(data.totalPages);
        setPage(data.number);
      } catch {
        toast({ title: "Không tải được cộng đồng", description: "Vui lòng thử lại.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchPosts(0, activeCategory);
  }, [activeCategory, fetchPosts]);

  const handleCreatePost = async () => {
    if (!newContent.trim()) return;
    setPosting(true);
    try {
      await communityApi.createPost({
        content: newContent,
        category: newCategory,
        jlptLevel: newJlptLevel || undefined,
      });
      setNewContent("");
      setNewCategory("GENERAL");
      setNewJlptLevel("");
      setShowCreatePost(false);
      fetchPosts(0, activeCategory);
      toast({ title: "Đã đăng bài", description: "Bài viết mới đã xuất hiện trong feed." });
    } catch {
      toast({ title: "Đăng bài chưa thành công", description: "Vui lòng thử lại.", variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const updated = (await communityApi.toggleLike(postId)) as Post;
      setPosts((prev) => prev.map((post) => (post.id === postId ? updated : post)));
    } catch {
      toast({ title: "Không thể thả tim", description: "Vui lòng thử lại.", variant: "destructive" });
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await communityApi.deletePost(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch {
      toast({ title: "Không thể xoá bài viết", description: "Vui lòng thử lại.", variant: "destructive" });
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
      setComments(data.content);
    } catch {
      toast({ title: "Không tải được bình luận", description: "Vui lòng thử lại.", variant: "destructive" });
    } finally {
      setLoadingComments(false);
    }
  };

  const handleComment = async (postId: number) => {
    if (!commentText.trim()) return;

    try {
      const newComment = (await communityApi.addComment(postId, commentText)) as Comment;
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, commentCount: post.commentCount + 1 } : post))
      );
    } catch {
      toast({ title: "Không gửi được bình luận", description: "Vui lòng thử lại.", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1380px]">
        <PageHeader
          icon={<Users className="h-6 w-6 text-pink-600" />}
          title="Cộng đồng"
          description="Feed được nén lại để nhìn được nhiều bài hơn trong một màn hình, đồng thời giữ composer gọn và rõ."
          eyebrow="Community"
          action={
            <Button className="rounded-2xl bg-pink-500 text-white hover:bg-pink-400" onClick={() => setShowCreatePost((prev) => !prev)}>
              <Plus className="mr-2 h-4 w-4" />
              Đăng bài
            </Button>
          }
        />

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <MetricCard hint="Bài đang hiển thị" icon={<MessageSquare className="h-4 w-4 text-sky-500" />} label="Bài viết" value={posts.length} />
          <MetricCard hint="Danh mục đang lọc" icon={<Lightbulb className="h-4 w-4 text-amber-500" />} label="Chủ đề" value={activeCategory || "Tất cả"} />
          <MetricCard hint="Nhịp tương tác nhẹ" icon={<Users className="h-4 w-4 text-violet-500" />} label="Feed" value="Thoáng" />
        </div>

        <PageSection className="mb-4" title="Chủ đề" description="Filter ngang nhỏ và nổi vừa đủ như một lớp điều hướng phụ.">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const active = activeCategory === category.value;
              return (
                <button
                  key={category.label}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                    active ? category.tone : "border-white/80 bg-white/90 text-slate-600 hover:bg-slate-50"
                  }`}
                  onClick={() => setActiveCategory(category.value)}
                  type="button"
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </PageSection>

        <AnimatePresence>
          {showCreatePost && (
            <motion.div animate={{ opacity: 1, y: 0 }} className="mb-4" exit={{ opacity: 0, y: -10 }} initial={{ opacity: 0, y: -10 }}>
              <PageSection title="Tạo bài viết" description="Composer thu gọn để không chiếm quá nhiều chiều cao của feed.">
                <div className="space-y-3">
                  <Textarea
                    className="min-h-[140px] rounded-[20px] border-white/80 bg-white/90 text-slate-900 placeholder:text-slate-400"
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Bạn đang muốn chia sẻ điều gì về việc học tiếng Nhật?"
                    value={newContent}
                  />
                  <div className="grid gap-3 md:grid-cols-[180px_140px_minmax(0,1fr)]">
                    <Select onValueChange={setNewCategory} value={newCategory}>
                      <SelectTrigger className="h-11 rounded-2xl border-white/80 bg-white/90 text-slate-700">
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
                      <SelectTrigger className="h-11 rounded-2xl border-white/80 bg-white/90 text-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Không gắn JLPT</SelectItem>
                        {["N5", "N4", "N3", "N2", "N1"].map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex justify-end gap-2">
                      <Button className="rounded-2xl border-slate-200 bg-white text-slate-600" onClick={() => setShowCreatePost(false)} variant="outline">
                        Huỷ
                      </Button>
                      <Button
                        className="rounded-2xl bg-pink-500 text-white hover:bg-pink-400"
                        disabled={posting || !newContent.trim()}
                        onClick={handleCreatePost}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {posting ? "Đang đăng..." : "Đăng bài"}
                      </Button>
                    </div>
                  </div>
                </div>
              </PageSection>
            </motion.div>
          )}
        </AnimatePresence>

        <PageSection title="Bảng tin" description="Card thấp hơn, metadata gom gọn, ít cảm giác nặng và tối hơn trước.">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 rounded-full border-4 border-pink-100 border-t-pink-500 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <EmptyState description="Hãy là người đầu tiên mở một cuộc trò chuyện mới." icon={<MessageSquare className="h-6 w-6" />} title="Chưa có bài viết" />
          ) : (
            <div className="space-y-3">
              {posts.map((post) => {
                const category = CATEGORIES.find((item) => item.value === post.category) || CATEGORIES[0];
                const Icon = category.icon;
                return (
                  <div key={post.id} className="rounded-[22px] border border-white bg-white p-4 shadow-[0_10px_24px_rgba(148,163,184,0.10)]">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f9a8d4,#c4b5fd)] text-sm font-semibold text-slate-900">
                          {post.userDisplayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{post.userDisplayName}</p>
                          <p className="text-xs text-slate-500">{timeAgo(post.createdAt)} trước</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Badge className={`rounded-full border ${category.tone}`}>
                          <Icon className="mr-1 h-3.5 w-3.5" />
                          {category.label}
                        </Badge>
                        {post.jlptLevel && post.jlptLevel !== "none" && (
                          <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-700">{post.jlptLevel}</Badge>
                        )}
                        {user?.id === post.userId && (
                          <Button className="h-8 w-8 rounded-xl" onClick={() => handleDeletePost(post.id)} size="icon" variant="ghost">
                            <Trash2 className="h-4 w-4 text-rose-500" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{post.content}</p>

                    <div className="mt-4 flex items-center gap-2 border-t border-slate-200/80 pt-3">
                      <Button
                        className={post.likedByCurrentUser ? "rounded-xl bg-pink-50 text-pink-700 hover:bg-pink-100" : "rounded-xl text-slate-500 hover:text-pink-600"}
                        onClick={() => handleLike(post.id)}
                        size="sm"
                        variant="ghost"
                      >
                        <Heart className={`mr-1 h-4 w-4 ${post.likedByCurrentUser ? "fill-pink-500 text-pink-500" : ""}`} />
                        {post.likeCount}
                      </Button>
                      <Button className="rounded-xl text-slate-500 hover:text-slate-900" onClick={() => loadComments(post.id)} size="sm" variant="ghost">
                        <MessageCircle className="mr-1 h-4 w-4" />
                        {post.commentCount}
                      </Button>
                    </div>

                    <AnimatePresence>
                      {openComments === post.id && (
                        <motion.div animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} initial={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="mt-4 space-y-3 border-t border-slate-200/80 pt-3">
                            <div className="flex gap-2">
                              <Input
                                className="h-10 rounded-xl border-white/80 bg-white/90 text-slate-900 placeholder:text-slate-400"
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                                placeholder="Viết bình luận..."
                                value={commentText}
                              />
                              <Button className="rounded-xl bg-slate-900 text-white hover:bg-slate-800" disabled={!commentText.trim()} onClick={() => handleComment(post.id)} size="icon">
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>

                            {loadingComments ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="h-10 w-10 rounded-full border-4 border-sky-100 border-t-sky-500 animate-spin" />
                              </div>
                            ) : comments.length === 0 ? (
                              <p className="text-sm text-slate-500">Chưa có bình luận nào.</p>
                            ) : (
                              comments.map((comment) => (
                                <div key={comment.id} className="rounded-[18px] border border-slate-200 bg-slate-50/70 p-3">
                                  <div className="mb-1 flex items-center gap-2">
                                    <span className="text-sm font-semibold text-slate-900">{comment.userDisplayName}</span>
                                    <span className="text-xs text-slate-500">{timeAgo(comment.createdAt)} trước</span>
                                  </div>
                                  <p className="text-sm text-slate-700">{comment.content}</p>
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

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button className="rounded-xl" disabled={page === 0} onClick={() => fetchPosts(page - 1, activeCategory)} size="sm" variant="outline">
                    Trước
                  </Button>
                  <span className="text-xs text-slate-500">
                    {page + 1} / {totalPages}
                  </span>
                  <Button className="rounded-xl" disabled={page >= totalPages - 1} onClick={() => fetchPosts(page + 1, activeCategory)} size="sm" variant="outline">
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
