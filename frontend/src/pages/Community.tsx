import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Heart, Send, Plus, Tag, Trash2, MessageCircle,
  Users, Lightbulb, HelpCircle, Award, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import WinterNightBackground from "@/components/WinterNightBackground";
import apiClient from "@/lib/apiClient";
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
  { value: "GENERAL", label: "Tổng hợp", icon: MessageSquare, color: "text-blue-400" },
  { value: "QUESTION", label: "Hỏi đáp", icon: HelpCircle, color: "text-yellow-400" },
  { value: "TIP", label: "Mẹo học", icon: Lightbulb, color: "text-green-400" },
  { value: "RESOURCE", label: "Tài liệu", icon: BookOpen, color: "text-purple-400" },
  { value: "ACHIEVEMENT", label: "Thành tích", icon: Award, color: "text-orange-400" },
];

const Community = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("GENERAL");
  const [newJlptLevel, setNewJlptLevel] = useState("");
  const [posting, setPosting] = useState(false);
  // Comments
  const [openComments, setOpenComments] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const fetchPosts = useCallback(async (pageNum = 0, category?: string) => {
    try {
      setLoading(true);
      const data = await apiClient.community.getPosts(pageNum, 20, category || undefined) as PagedPosts;
      setPosts(data.content);
      setTotalPages(data.totalPages);
      setPage(data.number);
    } catch {
      toast({ title: "Error", description: "Failed to load posts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchPosts(0, activeCategory); }, [fetchPosts, activeCategory]);

  const handleCreatePost = async () => {
    if (!newContent.trim()) return;
    setPosting(true);
    try {
      await apiClient.community.createPost({
        content: newContent,
        category: newCategory,
        jlptLevel: newJlptLevel || undefined,
      });
      setNewContent("");
      setShowCreatePost(false);
      toast({ title: "Posted!", description: "Bài viết đã được đăng" });
      fetchPosts(0, activeCategory);
    } catch {
      toast({ title: "Error", description: "Failed to create post", variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const updated = await apiClient.community.toggleLike(postId) as Post;
      setPosts(prev => prev.map(p => p.id === postId ? updated : p));
    } catch {
      toast({ title: "Error", description: "Like failed", variant: "destructive" });
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await apiClient.community.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast({ title: "Deleted", description: "Post deleted" });
    } catch {
      toast({ title: "Error", description: "Delete failed", variant: "destructive" });
    }
  };

  const loadComments = async (postId: number) => {
    if (openComments === postId) { setOpenComments(null); return; }
    setOpenComments(postId);
    setLoadingComments(true);
    try {
      const data = await apiClient.community.getComments(postId) as PagedComments;
      setComments(data.content);
    } catch {
      toast({ title: "Error", description: "Failed to load comments", variant: "destructive" });
    } finally {
      setLoadingComments(false);
    }
  };

  const handleComment = async (postId: number) => {
    if (!commentText.trim()) return;
    try {
      const newComment = await apiClient.community.addComment(postId, commentText) as Comment;
      setComments(prev => [newComment, ...prev]);
      setCommentText("");
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p));
    } catch {
      toast({ title: "Error", description: "Comment failed", variant: "destructive" });
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const catInfo = (cat: string) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[0];

  return (
    <DashboardLayout>
      <div className="min-h-screen relative">
        <WinterNightBackground snowCount={25} sparkleCount={12} intensity="light" />
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-3xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-pink-500/30">
                  <Users className="w-8 h-8 text-pink-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                    Cộng đồng コミュニティ
                  </h1>
                  <p className="text-muted-foreground">Chia sẻ kinh nghiệm học tiếng Nhật</p>
                </div>
              </div>
              <Button onClick={() => setShowCreatePost(!showCreatePost)} size="lg">
                <Plus className="w-5 h-5 mr-2" /> Đăng bài
              </Button>
            </div>
          </motion.div>

          {/* Create Post */}
          <AnimatePresence>
            {showCreatePost && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6">
                <Card className="bg-card/40 backdrop-blur-md border-border/50">
                  <CardContent className="pt-6 space-y-3">
                    <Textarea
                      placeholder="Bạn đang nghĩ gì? Chia sẻ kinh nghiệm, hỏi đáp, hoặc tip học tiếng Nhật..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="min-h-[120px] bg-background/50 resize-none"
                    />
                    <div className="flex gap-2 flex-wrap">
                      <Select value={newCategory} onValueChange={setNewCategory}>
                        <SelectTrigger className="w-[150px] bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <Select value={newJlptLevel} onValueChange={setNewJlptLevel}>
                        <SelectTrigger className="w-[100px] bg-background/50">
                          <SelectValue placeholder="JLPT" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {["N5", "N4", "N3", "N2", "N1"].map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setShowCreatePost(false)}>Hủy</Button>
                      <Button onClick={handleCreatePost} disabled={posting || !newContent.trim()}>
                        {posting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <><Send className="w-4 h-4 mr-2" /> Đăng</>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Filter */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <Button
              variant={activeCategory === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("")}
              className="rounded-full"
            >
              All
            </Button>
            {CATEGORIES.map((c) => (
              <Button
                key={c.value}
                variant={activeCategory === c.value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(c.value)}
                className="rounded-full"
              >
                <c.icon className={`w-4 h-4 mr-1 ${c.color}`} />
                {c.label}
              </Button>
            ))}
          </motion.div>

          {/* Posts Feed */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">Chưa có bài viết nào</p>
              <p className="text-sm text-muted-foreground">Hãy là người đầu tiên chia sẻ!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, index) => {
                const cat = catInfo(post.category);
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-card/40 backdrop-blur-md border-border/50 hover:bg-card/50 transition-all">
                      <CardContent className="pt-6">
                        {/* Post Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
                              {post.userDisplayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{post.userDisplayName}</p>
                              <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <cat.icon className={`w-3 h-3 mr-1 ${cat.color}`} />
                              {cat.label}
                            </Badge>
                            {post.jlptLevel && post.jlptLevel !== "none" && (
                              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">{post.jlptLevel}</Badge>
                            )}
                            {user?.id === post.userId && (
                              <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)}>
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Post Content */}
                        <p className="text-white/90 whitespace-pre-wrap mb-4 leading-relaxed">{post.content}</p>

                        {/* Actions */}
                        <div className="flex items-center gap-4 pt-3 border-t border-border/30">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id)}
                            className={post.likedByCurrentUser ? "text-pink-400" : "text-muted-foreground"}
                          >
                            <Heart className={`w-4 h-4 mr-1 ${post.likedByCurrentUser ? "fill-pink-400" : ""}`} />
                            {post.likeCount}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => loadComments(post.id)} className="text-muted-foreground">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {post.commentCount}
                          </Button>
                        </div>

                        {/* Comments Section */}
                        <AnimatePresence>
                          {openComments === post.id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="mt-4 pt-3 border-t border-border/30 space-y-3">
                                {/* New comment */}
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Viết bình luận..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                                    className="bg-background/50"
                                  />
                                  <Button size="sm" onClick={() => handleComment(post.id)} disabled={!commentText.trim()}>
                                    <Send className="w-4 h-4" />
                                  </Button>
                                </div>
                                {/* Comment list */}
                                {loadingComments ? (
                                  <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                                  </div>
                                ) : (
                                  comments.map((c) => (
                                    <div key={c.id} className="flex gap-3 p-2 rounded-lg bg-background/30">
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                        {c.userDisplayName.charAt(0).toUpperCase()}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-semibold">{c.userDisplayName}</span>
                                          <span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span>
                                        </div>
                                        <p className="text-sm text-white/80">{c.content}</p>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 py-4">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => fetchPosts(page - 1, activeCategory)}>
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground self-center">Page {page + 1} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => fetchPosts(page + 1, activeCategory)}>
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Community;
