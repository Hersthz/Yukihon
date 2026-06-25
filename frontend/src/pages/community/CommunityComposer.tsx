import { Send } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES } from "./constants";

interface CommunityComposerProps {
  newTitle: string;
  newContent: string;
  newCategory: string;
  newJlptLevel: string;
  newTags: string;
  posting: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onJlptLevelChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const CommunityComposer = ({
  newTitle,
  newContent,
  newCategory,
  newJlptLevel,
  newTags,
  posting,
  onTitleChange,
  onContentChange,
  onCategoryChange,
  onJlptLevelChange,
  onTagsChange,
  onCancel,
  onSubmit,
}: CommunityComposerProps) => (
  <PageSection
    title="Tạo bài viết mới"
    description="Thêm tiêu đề và thẻ để feed có cấu trúc hơn và dễ tìm lại hơn."
  >
    <div className="space-y-3">
      <Input
        className="h-11 rounded-2xl border-border bg-card text-foreground placeholder:text-muted-foreground"
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="Tiêu đề ngắn gọn cho bài viết"
        value={newTitle}
      />
      <Textarea
        className="min-h-[140px] rounded-[20px] border-border bg-card text-foreground placeholder:text-muted-foreground"
        onChange={(event) => onContentChange(event.target.value)}
        placeholder="Bạn đang muốn chia sẻ điều gì về việc học tiếng Nhật?"
        value={newContent}
      />
      <div className="grid gap-3 md:grid-cols-4">
        <Select onValueChange={onCategoryChange} value={newCategory}>
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

        <Select onValueChange={onJlptLevelChange} value={newJlptLevel || "none"}>
          <SelectTrigger className="h-11 rounded-2xl border-border bg-card text-foreground/80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Không JLPT</SelectItem>
            {["N5", "N4", "N3", "N2", "N1"].map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          className="h-11 rounded-2xl border-border bg-card text-foreground placeholder:text-muted-foreground"
          onChange={(event) => onTagsChange(event.target.value)}
          placeholder="tag1, tag2, tag3"
          value={newTags}
        />

        <div className="flex gap-2">
          <Button
            className="flex-1 rounded-2xl border-border bg-white text-muted-foreground"
            onClick={onCancel}
            variant="outline"
          >
            Hủy
          </Button>
          <Button
            className="flex-1 rounded-2xl bg-pink-500 text-white hover:bg-pink-400"
            disabled={posting || !newContent.trim()}
            onClick={onSubmit}
          >
            <Send className="mr-2 h-4 w-4" />
            Dang
          </Button>
        </div>
      </div>
    </div>
  </PageSection>
);

export default CommunityComposer;
