import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, FileUp, Loader2, Upload } from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader, PageSection } from "@/components/layout/UserPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  importApi,
  type DuplicateStrategy,
  type ImportField,
  type ImportPreview,
} from "@/api/importApi";

const FIELD_OPTIONS: { value: ImportField; label: string }[] = [
  { value: "FRONT", label: "Mặt trước" },
  { value: "BACK", label: "Mặt sau / nghĩa" },
  { value: "HINT", label: "Gợi ý" },
  { value: "READING", label: "Cách đọc (kana)" },
  { value: "ROMAJI", label: "Romaji" },
  { value: "ONYOMI", label: "Âm On" },
  { value: "KUNYOMI", label: "Âm Kun" },
  { value: "EXAMPLE", label: "Ví dụ" },
  { value: "EXAMPLE_TRANSLATION", label: "Dịch ví dụ" },
  { value: "NOTE", label: "Ghi chú" },
  { value: "IMAGE", label: "Ảnh (URL)" },
  { value: "AUDIO", label: "Âm thanh (URL)" },
  { value: "IGNORE", label: "Bỏ qua" },
];

const DUP_OPTIONS: { value: DuplicateStrategy; label: string }[] = [
  { value: "SKIP", label: "Bỏ qua thẻ trùng" },
  { value: "UPDATE", label: "Cập nhật thẻ trùng" },
  { value: "CREATE_NEW", label: "Tạo mới tất cả" },
];

const DELIMITERS = [
  { value: "AUTO", label: "Tự nhận diện" },
  { value: "COMMA", label: "Dấu phẩy (,)" },
  { value: "TAB", label: "Tab" },
  { value: "SEMICOLON", label: "Chấm phẩy (;)" },
  { value: "PIPE", label: "Gạch đứng (|)" },
];

const downloadSample = () => {
  const csv = "front,back,hint\n犬,chó,inu\n猫,mèo,neko\n学校,trường học,gakkou\n";
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "yukihon-deck-template.csv";
  a.click();
  URL.revokeObjectURL(url);
};

const ImportDeckPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [delimiter, setDelimiter] = useState("AUTO");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [mapping, setMapping] = useState<string[]>([]);
  const [deckTitle, setDeckTitle] = useState("");
  const [dupStrategy, setDupStrategy] = useState<DuplicateStrategy>("SKIP");

  const previewMutation = useMutation({
    mutationFn: (f: File) => importApi.preview(f, delimiter),
    onSuccess: (data) => {
      setPreview(data);
      setMapping(data.suggestedMapping);
    },
    onError: (e: unknown) =>
      toast({
        title: "Không đọc được file",
        description: e instanceof Error ? e.message : "Lỗi",
        variant: "destructive",
      }),
  });

  const confirmMutation = useMutation({
    mutationFn: () =>
      importApi.confirm({
        deckTitle: deckTitle.trim() || file?.name?.replace(/\.[^.]+$/, "") || "Bộ thẻ nhập",
        visibility: "PRIVATE",
        duplicateStrategy: dupStrategy,
        mapping,
        rows: preview?.rows ?? [],
      }),
    onSuccess: (res) => {
      const parts = [`Đã tạo ${res.created} thẻ`];
      if (res.updated) parts.push(`cập nhật ${res.updated}`);
      if (res.skipped) parts.push(`bỏ qua ${res.skipped}`);
      toast({
        title: "Nhập thành công",
        description: parts.join(", ") + ".",
      });
      navigate(`/decks/${res.deckId}/cards`);
    },
    onError: (e: unknown) =>
      toast({
        title: "Nhập thất bại",
        description: e instanceof Error ? e.message : "Lỗi",
        variant: "destructive",
      }),
  });

  const onFile = (f: File | null) => {
    setFile(f);
    setPreview(null);
    if (f) {
      if (!deckTitle) setDeckTitle(f.name.replace(/\.[^.]+$/, ""));
      previewMutation.mutate(f);
    }
  };

  const hasFront = mapping.includes("FRONT");

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1100px]">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link to="/decks">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Bộ thẻ
          </Link>
        </Button>

        <PageHeader
          icon={<FileUp className="h-5 w-5 text-primary" />}
          eyebrow="Nhập hàng loạt"
          title="Nhập bộ thẻ từ file"
          description="Hỗ trợ CSV / TSV / TXT. Tải mẫu, chọn file rồi gán cột tương ứng."
          action={
            <Button variant="outline" onClick={downloadSample}>
              <Download className="mr-1.5 h-4 w-4" />
              Tải mẫu CSV
            </Button>
          }
        />

        <PageSection title="1. Chọn file" className="mb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label>File (.csv, .tsv, .txt)</Label>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.tsv,.txt,text/csv,text/plain"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                className="block w-full rounded-xl border border-border bg-card px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Dấu phân cách</Label>
              <Select
                value={delimiter}
                onValueChange={(v) => {
                  setDelimiter(v);
                  if (file) previewMutation.mutate(file);
                }}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELIMITERS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {previewMutation.isPending && (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang đọc file…
            </p>
          )}
        </PageSection>

        {preview && (
          <>
            <PageSection
              title="2. Gán cột"
              description="Chọn mỗi cột tương ứng với phần nào của thẻ."
              className="mb-4"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {preview.columns.map((col, i) => (
                        <th key={i} className="px-3 py-2 text-left align-top">
                          <p
                            className="mb-1.5 truncate font-semibold text-foreground"
                            title={col.header}
                          >
                            {col.header}
                          </p>
                          <Select
                            value={mapping[i] ?? "IGNORE"}
                            onValueChange={(v) =>
                              setMapping((m) => m.map((x, idx) => (idx === i ? v : x)))
                            }
                          >
                            <SelectTrigger className="h-8 w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FIELD_OPTIONS.map((f) => (
                                <SelectItem key={f.value} value={f.value}>
                                  {f.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 6).map((row, r) => (
                      <tr key={r} className="border-b border-border/50">
                        {preview.columns.map((_, c) => (
                          <td
                            key={c}
                            className="max-w-[200px] truncate px-3 py-2 text-muted-foreground"
                          >
                            {row[c] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!hasFront && (
                <p className="mt-3 text-sm text-red-600">
                  Cần chọn ít nhất một cột là “Mặt trước”.
                </p>
              )}
            </PageSection>

            <PageSection title="3. Tạo bộ thẻ">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-1.5">
                  <Label>Tên bộ thẻ</Label>
                  <Input value={deckTitle} onChange={(e) => setDeckTitle(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Thẻ trùng (cùng mặt trước)</Label>
                  <Select
                    value={dupStrategy}
                    onValueChange={(v) => setDupStrategy(v as DuplicateStrategy)}
                  >
                    <SelectTrigger className="w-52">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DUP_OPTIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => confirmMutation.mutate()}
                  disabled={!hasFront || confirmMutation.isPending}
                >
                  {confirmMutation.isPending ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-1.5 h-4 w-4" />
                  )}
                  Nhập {preview.totalRows} dòng
                </Button>
              </div>
            </PageSection>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ImportDeckPage;
