import { useMemo, useState } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getOptionLabel } from "./form-utils";

export interface SelectableContent {
  id?: number;
  title?: string;
  kanji?: string;
  meaning?: string;
  pattern?: string;
}

const normalizeSearch = (value: string) => value.trim().toLowerCase();

export const OptionPicker = ({
  label,
  description,
  options,
  selectedIds,
  onToggle,
}: {
  label: string;
  description: string;
  options: SelectableContent[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = normalizeSearch(query);

    return options
      .filter((item) => item.id != null)
      .filter((item) => {
        if (!normalized) return true;
        return [item.title, item.kanji, item.meaning, item.pattern]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalized));
      })
      .slice(0, 24);
  }, [options, query]);

  return (
    <div className="rounded-[22px] border border-border bg-background/40 p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="bg-background/60"
        placeholder={`Search ${label.toLowerCase()}...`}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {selectedIds.length === 0 ? (
          <span className="text-xs text-muted-foreground">No linked items yet.</span>
        ) : null}
        {selectedIds.map((id) => {
          const item = options.find((option) => option.id === id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => onToggle(id)}
              className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary transition hover:bg-primary/20"
            >
              {getOptionLabel(item ?? { id })} x
            </button>
          );
        })}
      </div>

      <div className="mt-3 max-h-44 overflow-y-auto rounded-[18px] border border-border bg-card/40 p-3">
        <div className="flex flex-wrap gap-2">
          {filtered.map((item) => {
            const id = item.id as number;
            const active = selectedIds.includes(id);

            return (
              <button
                key={id}
                type="button"
                onClick={() => onToggle(id)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {getOptionLabel(item)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const MediaField = ({
  label,
  value,
  accept,
  uploading,
  previewType,
  onChange,
  onUpload,
}: {
  label: string;
  value: string;
  accept: string;
  uploading: boolean;
  previewType: "image" | "audio" | "video";
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<void>;
}) => (
  <div className="space-y-2 rounded-[22px] border border-border bg-background/40 p-4">
    <Label>{label}</Label>
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="bg-background/60"
      placeholder="Paste URL or upload a file"
    />

    <div className="flex items-center gap-3">
      <Input
        type="file"
        accept={accept}
        className="bg-background/60"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void onUpload(file);
          }
          event.currentTarget.value = "";
        }}
      />
      <Button disabled={uploading} size="sm" variant="outline" className="rounded-xl">
        <UploadCloud className="mr-2 h-4 w-4" />
        {uploading ? "Uploading..." : "Upload"}
      </Button>
    </div>

    {value ? (
      <div className="rounded-[18px] border border-border bg-card/40 p-3">
        {previewType === "image" ? (
          <img src={value} alt={label} className="h-32 w-full rounded-xl object-cover" />
        ) : null}
        {previewType === "audio" ? <audio controls src={value} className="mb-3 w-full" /> : null}
        {previewType === "video" ? (
          <video controls src={value} className="mb-3 h-32 w-full rounded-xl object-cover" />
        ) : null}
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-primary underline underline-offset-4"
        >
          Open uploaded asset
        </a>
      </div>
    ) : null}
  </div>
);
