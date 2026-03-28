import { AnimatePresence, motion } from "framer-motion";
import { BookmarkPlus, Edit3, Folder, Search, Star, StarOff, StickyNote, Trash2 } from "lucide-react";
import { EmptyState, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SavedWord, WordStats } from "./types";
import { formatAbsoluteDate, formatRelativeReview } from "./utils";

interface NotebookSectionProps {
  loading: boolean;
  words: SavedWord[];
  stats: WordStats;
  search: string;
  filterFolder: string;
  filterMastered: string;
  editingNote: number | null;
  noteText: string;
  onSearchChange: (value: string) => void;
  onFilterFolderChange: (value: string) => void;
  onFilterMasteredChange: (value: string) => void;
  onStartEditingNote: (wordId: number, note: string) => void;
  onNoteTextChange: (value: string) => void;
  onSaveNote: (wordId: number) => void;
  onToggleMastered: (wordId: number) => void;
  onRemoveWord: (wordId: number) => void;
}

const NotebookSection = ({
  loading,
  words,
  stats,
  search,
  filterFolder,
  filterMastered,
  editingNote,
  noteText,
  onSearchChange,
  onFilterFolderChange,
  onFilterMasteredChange,
  onStartEditingNote,
  onNoteTextChange,
  onSaveNote,
  onToggleMastered,
  onRemoveWord,
}: NotebookSectionProps) => (
  <>
    <PageSection className="mb-4" title="Notebook filters" description="Van giu so tay de ban tim nhanh, note, xoa hoac xem lich review cua tung muc.">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 rounded-2xl border-border bg-card pl-11 text-foreground placeholder:text-muted-foreground"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tim theo kanji, hiragana, romaji hoac nghia"
            value={search}
          />
        </div>

        <Select onValueChange={(value) => onFilterFolderChange(value === "all" ? "" : value)} value={filterFolder || "all"}>
          <SelectTrigger className="h-11 rounded-2xl border-border bg-card text-foreground/80">
            <Folder className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Folder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tat ca folder</SelectItem>
            {stats.folders.map((folder) => (
              <SelectItem key={folder} value={folder}>
                {folder}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => onFilterMasteredChange(value === "all" ? "" : value)} value={filterMastered || "all"}>
          <SelectTrigger className="h-11 rounded-2xl border-border bg-card text-foreground/80">
            <SelectValue placeholder="Trang thai" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tat ca</SelectItem>
            <SelectItem value="true">Da thuoc</SelectItem>
            <SelectItem value="false">Chua thuoc</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </PageSection>

    <PageSection title="So tay ca nhan" description="Moi the giu ca thong tin notebook va SRS: next review, interval, note va trang thai nho.">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500" />
        </div>
      ) : words.length === 0 ? (
        <EmptyState
          description="Hay luu tu tu dictionary hoac bai hoc de bat dau tao bo review."
          icon={<BookmarkPlus className="h-6 w-6" />}
          title="Notebook dang trong"
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {words.map((word, index) => (
              <motion.div
                key={word.id}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[22px] border border-white bg-card p-4 shadow-[0_10px_24px_rgba(148,163,184,0.10)]"
                exit={{ opacity: 0, y: -10 }}
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: index * 0.02 }}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[1.5rem] font-semibold text-foreground">{word.kanji || word.hiragana}</p>
                    <p className="text-sm text-sky-700">{word.hiragana}</p>
                    <p className="text-xs text-muted-foreground">{word.romaji}</p>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    {word.jlptLevel ? (
                      <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-700">{word.jlptLevel}</Badge>
                    ) : null}
                    {word.folderName ? (
                      <Badge className="rounded-full border border-border bg-muted text-muted-foreground">{word.folderName}</Badge>
                    ) : null}
                  </div>
                </div>

                <p className="text-sm text-foreground/80">{word.meaning}</p>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-[16px] border border-border bg-muted/40 p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Next review</p>
                    <p className="mt-2 font-medium text-foreground">{formatAbsoluteDate(word.nextReviewAt)}</p>
                  </div>
                  <div className="rounded-[16px] border border-border bg-muted/40 p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Interval</p>
                    <p className="mt-2 font-medium text-foreground">{word.reviewIntervalDays} ngay</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{word.studyFocus}</span>
                  <span>·</span>
                  <span>{word.dueForReview ? "Dang den han" : formatRelativeReview(word.nextReviewAt)}</span>
                  <span>·</span>
                  <span>{word.mastered ? "Da thuoc" : "Dang hoc"}</span>
                </div>

                {editingNote === word.id ? (
                  <div className="mt-3 flex gap-2">
                    <Input
                      className="h-10 rounded-xl border-border bg-card text-sm text-foreground"
                      onChange={(event) => onNoteTextChange(event.target.value)}
                      onKeyDown={(event) => event.key === "Enter" && onSaveNote(word.id)}
                      placeholder="Them mot ghi chu ngan"
                      value={noteText}
                    />
                    <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => onSaveNote(word.id)} size="sm">
                      Luu
                    </Button>
                  </div>
                ) : word.personalNote ? (
                  <div className="mt-3 rounded-[18px] border border-amber-200 bg-amber-50/80 p-3">
                    <div className="flex items-start gap-2">
                      <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase tracking-[0.18em] text-amber-700">Ghi chu</p>
                        <p className="mt-1 text-sm text-amber-900">{word.personalNote}</p>
                      </div>
                      <Button className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground" onClick={() => onStartEditingNote(word.id, word.personalNote)} size="icon" variant="ghost">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 flex items-center gap-2">
                  <Button
                    className={word.mastered ? "rounded-xl bg-emerald-500 text-white hover:bg-emerald-400" : "rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100"}
                    onClick={() => onToggleMastered(word.id)}
                    size="sm"
                  >
                    {word.mastered ? <StarOff className="mr-1 h-4 w-4" /> : <Star className="mr-1 h-4 w-4" />}
                    {word.mastered ? "Bo mastered" : "Mark mastered"}
                  </Button>

                  {!word.personalNote ? (
                    <Button className="rounded-xl border-border bg-white text-muted-foreground" onClick={() => onStartEditingNote(word.id, "")} size="sm" variant="outline">
                      <StickyNote className="mr-1 h-4 w-4" />
                      Ghi chu
                    </Button>
                  ) : null}

                  <Button className="ml-auto rounded-xl text-rose-600 hover:text-rose-700" onClick={() => onRemoveWord(word.id)} size="icon" variant="ghost">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </PageSection>
  </>
);

export default NotebookSection;
