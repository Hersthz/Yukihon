import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Heart, MessageCircle, MessageSquare, Send, Trash2 } from "lucide-react";
import { EmptyState, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "./constants";
import { Comment, Post } from "./types";
import { timeAgo } from "./utils";

interface CommunityFeedProps {
  loading: boolean;
  posts: Post[];
  showBookmarkedOnly: boolean;
  openComments: number | null;
  commentsByPost: Record<number, Comment[]>;
  commentInputs: Record<number, string>;
  loadingComments: boolean;
  currentUserId?: number;
  page: number;
  totalPages: number;
  onLike: (postId: number) => void;
  onBookmark: (postId: number) => void;
  onDeletePost: (postId: number) => void;
  onToggleComments: (postId: number) => void;
  onCommentInputChange: (postId: number, value: string) => void;
  onSubmitComment: (postId: number) => void;
  onPageChange: (page: number) => void;
}

const CommunityFeed = ({
  loading,
  posts,
  showBookmarkedOnly,
  openComments,
  commentsByPost,
  commentInputs,
  loadingComments,
  currentUserId,
  page,
  totalPages,
  onLike,
  onBookmark,
  onDeletePost,
  onToggleComments,
  onCommentInputChange,
  onSubmitComment,
  onPageChange,
}: CommunityFeedProps) => (
  <PageSection
    title="Bang tin"
    description="Feed da co title, tags va bookmark nen de scan nhanh va luu lai bai hay hon."
  >
    {loading ? (
      <div className="flex items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-100 border-t-pink-500" />
      </div>
    ) : posts.length === 0 ? (
      <EmptyState
        description={
          showBookmarkedOnly
            ? "Ban chua bookmark bai viet nao trong trang hien tai."
            : "Hay la nguoi dau tien mo mot cuoc tro chuyen moi."
        }
        icon={<MessageSquare className="h-6 w-6" />}
        title="Chua co bai viet"
      />
    ) : (
      <div className="space-y-3">
        {posts.map((post) => {
          const category = CATEGORIES.find((item) => item.value === post.category) || CATEGORIES[0];
          const Icon = category.icon;
          const comments = commentsByPost[post.id] || [];

          return (
            <div
              key={post.id}
              className="rounded-[22px] border border-white bg-card p-4 shadow-[0_10px_24px_rgba(148,163,184,0.10)]"
            >
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
                  {post.jlptLevel ? (
                    <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-700">
                      {post.jlptLevel}
                    </Badge>
                  ) : null}
                  {currentUserId === post.userId ? (
                    <Button
                      className="h-8 w-8 rounded-xl"
                      onClick={() => onDeletePost(post.id)}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4 text-rose-500" />
                    </Button>
                  ) : null}
                </div>
              </div>

              {post.title ? (
                <h3 className="mb-2 text-lg font-semibold text-foreground">{post.title}</h3>
              ) : null}
              <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/80">
                {post.content}
              </p>

              {post.tags?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={`${post.id}-${tag}`}
                      className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-4 flex items-center gap-2 border-t border-border/80 pt-3">
                <Button
                  className={
                    post.likedByCurrentUser
                      ? "rounded-xl bg-pink-50 text-pink-700 hover:bg-pink-100"
                      : "rounded-xl text-muted-foreground hover:text-pink-600"
                  }
                  onClick={() => onLike(post.id)}
                  size="sm"
                  variant="ghost"
                >
                  <Heart
                    className={`mr-1 h-4 w-4 ${post.likedByCurrentUser ? "fill-pink-500 text-pink-500" : ""}`}
                  />
                  {post.likeCount}
                </Button>
                <Button
                  className="rounded-xl text-muted-foreground hover:text-foreground"
                  onClick={() => onToggleComments(post.id)}
                  size="sm"
                  variant="ghost"
                >
                  <MessageCircle className="mr-1 h-4 w-4" />
                  {post.commentCount}
                </Button>
                <Button
                  className={
                    post.bookmarkedByCurrentUser
                      ? "rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100"
                      : "rounded-xl text-muted-foreground hover:text-amber-600"
                  }
                  onClick={() => onBookmark(post.id)}
                  size="sm"
                  variant="ghost"
                >
                  <Bookmark
                    className={`mr-1 h-4 w-4 ${post.bookmarkedByCurrentUser ? "fill-amber-500 text-amber-500" : ""}`}
                  />
                  Luu
                </Button>
              </div>

              <AnimatePresence>
                {openComments === post.id ? (
                  <motion.div
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    initial={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-3 border-t border-border/80 pt-3">
                      <div className="flex gap-2">
                        <Input
                          className="h-10 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground"
                          onChange={(event) => onCommentInputChange(post.id, event.target.value)}
                          onKeyDown={(event) => event.key === "Enter" && onSubmitComment(post.id)}
                          placeholder="Viet binh luan..."
                          value={commentInputs[post.id] || ""}
                        />
                        <Button
                          className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                          disabled={!(commentInputs[post.id] || "").trim()}
                          onClick={() => onSubmitComment(post.id)}
                          size="icon"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>

                      {loadingComments ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-100 border-t-sky-500" />
                        </div>
                      ) : comments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Chua co binh luan nao.</p>
                      ) : (
                        comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="rounded-[18px] border border-border bg-muted/40 p-3"
                          >
                            <div className="mb-1 flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">
                                {comment.userDisplayName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {timeAgo(comment.createdAt)} truoc
                              </span>
                            </div>
                            <p className="text-sm text-foreground/80">{comment.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}

        {totalPages > 1 ? (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              className="rounded-xl"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              size="sm"
              variant="outline"
            >
              Truoc
            </Button>
            <span className="text-xs text-muted-foreground">
              {page + 1} / {totalPages}
            </span>
            <Button
              className="rounded-xl"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              size="sm"
              variant="outline"
            >
              Sau
            </Button>
          </div>
        ) : null}
      </div>
    )}
  </PageSection>
);

export default CommunityFeed;
