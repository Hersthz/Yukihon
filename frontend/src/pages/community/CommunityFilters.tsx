import { Bookmark, Search } from "lucide-react";
import { PageSection } from "@/components/layout/UserPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, JLPT_OPTIONS } from "./constants";

interface CommunityFiltersProps {
  activeCategory: string;
  jlptFilter: (typeof JLPT_OPTIONS)[number];
  search: string;
  showBookmarkedOnly: boolean;
  onActiveCategoryChange: (value: string) => void;
  onJlptFilterChange: (value: (typeof JLPT_OPTIONS)[number]) => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onToggleBookmarked: () => void;
}

const CommunityFilters = ({
  activeCategory,
  jlptFilter,
  search,
  showBookmarkedOnly,
  onActiveCategoryChange,
  onJlptFilterChange,
  onSearchChange,
  onSearchSubmit,
  onToggleBookmarked,
}: CommunityFiltersProps) => (
  <PageSection
    title="Bộ lọc thông minh"
    description="Tìm bài theo chủ đề, JLPT, từ khóa và bookmark mà không cần rời khỏi feed."
  >
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 rounded-2xl border-border bg-card pl-11 text-foreground placeholder:text-muted-foreground"
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && onSearchSubmit()}
            placeholder="Tìm theo tiêu đề, nội dung, hoặc thẻ"
            value={search}
          />
        </div>

        <Select
          value={jlptFilter}
          onValueChange={(value) => onJlptFilterChange(value as (typeof JLPT_OPTIONS)[number])}
        >
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

        <Button className="h-11 rounded-2xl" onClick={onSearchSubmit}>
          <Search className="mr-2 h-4 w-4" />
          Tìm
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
                active
                  ? category.tone
                  : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
              onClick={() => onActiveCategoryChange(category.value)}
              type="button"
            >
              <Icon className="h-4 w-4" />
              {category.label}
            </button>
          );
        })}

        <button
          className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition ${
            showBookmarkedOnly
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-border bg-card text-muted-foreground hover:bg-muted"
          }`}
          onClick={onToggleBookmarked}
          type="button"
        >
          <Bookmark className="h-4 w-4" />
          Đã lưu
        </button>
      </div>
    </div>
  </PageSection>
);

export default CommunityFilters;
