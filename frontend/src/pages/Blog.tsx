import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BookOpen, Calendar, Tag, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState, PageHeader, PageSection } from "@/components/layout/UserPage";
import { blogApi, type BlogPostDto } from "@/api/blogApi";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

const PostCard = ({ post }: { post: BlogPostDto }) => (
  <Link
    to={`/blog/${post.slug}`}
    className="yukihon-card group flex flex-col gap-3 p-5 transition-all hover:border-primary/30 hover:shadow-md"
  >
    {post.coverImageUrl && (
      <img
        src={post.coverImageUrl}
        alt={post.title}
        className="w-full h-44 object-cover rounded-lg"
      />
    )}
    <div className="flex flex-wrap gap-1.5">
      {post.tags.slice(0, 3).map((tag) => (
        <Badge key={tag} variant="secondary" className="text-xs">
          {tag}
        </Badge>
      ))}
    </div>
    <h2 className="text-base font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
      {post.title}
    </h2>
    {post.excerpt && (
      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{post.excerpt}</p>
    )}
    <div className="flex items-center gap-3 mt-auto pt-2 text-xs text-muted-foreground border-t border-border/40">
      {post.authorName && (
        <span className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {post.authorName}
        </span>
      )}
      <span className="flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        {formatDate(post.publishedAt ?? post.createdAt)}
      </span>
    </div>
  </Link>
);

const Blog = () => {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog", "published"],
    queryFn: () => blogApi.getPublished(),
  });

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags)));

  const filtered = posts.filter((p) => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.excerpt ?? "").toLowerCase().includes(search.toLowerCase());
    const matchTag = !activeTag || p.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog"
        description="Bài viết kiến thức tiếng Nhật từ đội ngũ Yukihon"
        icon={<BookOpen className="h-5 w-5 text-primary" />}
        eyebrow="Kiến thức"
      />

      <PageSection>
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <Input
            placeholder="Tìm kiếm bài viết..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm h-9"
          />
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <Badge
                variant={activeTag === null ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setActiveTag(null)}
              >
                Tất cả
              </Badge>
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={activeTag === tag ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="yukihon-card h-64 animate-pulse bg-muted/30" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-8 h-8" />}
            title="Chưa có bài viết"
            description="Chưa có bài viết nào phù hợp với bộ lọc hiện tại."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </PageSection>
    </div>
  );
};

export default Blog;
