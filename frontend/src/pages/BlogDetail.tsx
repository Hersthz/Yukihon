import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Calendar, Tag, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { blogApi } from "@/api/blogApi";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["blog", "slug", slug],
    queryFn: () => blogApi.getPublishedBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 py-8">
        <div className="h-8 bg-muted/40 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-muted/30 rounded animate-pulse w-1/2" />
        <div className="space-y-3 mt-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted/25 rounded animate-pulse" style={{ width: `${70 + (i % 3) * 10}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <p className="text-muted-foreground">Không tìm thấy bài viết này.</p>
        <Button variant="outline" asChild>
          <Link to="/blog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại Blog
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/blog">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Blog
        </Link>
      </Button>

      {/* Cover */}
      {post.coverImageUrl && (
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className="w-full h-56 object-cover rounded-xl"
        />
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-2xl font-bold leading-snug">{post.title}</h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-4 border-b border-border/50">
        {post.authorName && (
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            {post.authorName}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          {formatDate(post.publishedAt ?? post.createdAt)}
        </span>
      </div>

      {/* Content */}
      {post.content ? (
        <div className="prose prose-sm prose-slate max-w-none
          prose-headings:font-semibold prose-headings:text-foreground
          prose-p:text-foreground/85 prose-p:leading-relaxed
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:rounded
          prose-pre:bg-muted prose-pre:border prose-pre:border-border/50
          prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
          prose-img:rounded-lg">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-muted-foreground italic">Bài viết chưa có nội dung.</p>
      )}
    </div>
  );
};

export default BlogDetail;
