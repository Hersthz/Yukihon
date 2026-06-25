import { BookOpen } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader, PageSection } from "@/components/layout/UserPage";

interface Source {
  name: string;
  url: string;
  license: string;
  use: string;
}

const SOURCES: Source[] = [
  {
    name: "JMdict / JMnedict",
    url: "https://www.edrdg.org/jmdict/j_jmdict.html",
    license: "EDRDG License",
    use: "Dữ liệu từ vựng tiếng Nhật (tra cứu từ điển).",
  },
  {
    name: "KANJIDIC",
    url: "https://www.edrdg.org/wiki/index.php/KANJIDIC_Project",
    license: "CC BY-SA 4.0",
    use: "Dữ liệu kanji.",
  },
  {
    name: "Tatoeba",
    url: "https://tatoeba.org/",
    license: "CC BY 2.0 FR",
    use: "Câu ví dụ tiếng Nhật kèm bản dịch.",
  },
  {
    name: "MyMemory",
    url: "https://mymemory.translated.net/",
    license: "Theo điều khoản dịch vụ của MyMemory",
    use: "Dịch máy (Nhật ↔ Việt/Anh).",
  },
];

const Credits = () => {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[920px]">
        <PageHeader
          icon={<BookOpen className="h-6 w-6 text-sky-600" />}
          title="Nguồn dữ liệu & Giấy phép"
          description="Yukihon sử dụng các nguồn dữ liệu mở dưới đây. Xin cảm ơn các dự án đã chia sẻ."
          eyebrow="Ghi nhận nguồn"
        />

        <PageSection
          title="Nguồn dữ liệu"
          description="Mỗi nguồn được dùng theo giấy phép tương ứng."
        >
          <ul className="space-y-3">
            {SOURCES.map((s) => (
              <li key={s.name} className="rounded-[18px] border border-border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-sky-700 hover:underline"
                  >
                    {s.name}
                  </a>
                  <span className="text-xs text-muted-foreground">{s.license}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{s.use}</p>
              </li>
            ))}
          </ul>
        </PageSection>
      </div>
    </DashboardLayout>
  );
};

export default Credits;
