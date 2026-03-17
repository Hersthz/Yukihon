import { useCallback, useEffect, useState } from "react";
import { Bell, BookOpen, Globe, Palette, RotateCcw, Save, Target, Volume2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/api";

interface UserSettingsData {
  theme: string;
  language: string;
  dailyGoalMinutes: number;
  notificationsEnabled: boolean;
  showFurigana: boolean;
  showRomaji: boolean;
  autoPlayAudio: boolean;
  quizDifficulty: string;
  targetJlptLevel: string;
}

const DEFAULT_SETTINGS: UserSettingsData = {
  theme: "light",
  language: "vi",
  dailyGoalMinutes: 30,
  notificationsEnabled: true,
  showFurigana: true,
  showRomaji: true,
  autoPlayAudio: false,
  quizDifficulty: "MEDIUM",
  targetJlptLevel: "N5",
};

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettingsData>(DEFAULT_SETTINGS);
  const [original, setOriginal] = useState<UserSettingsData>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const data = (await apiClient.settings.get()) as UserSettingsData;
      setSettings(data);
      setOriginal(data);
    } catch {
      setSettings(DEFAULT_SETTINGS);
      setOriginal(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const update = (key: keyof UserSettingsData, value: string | number | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = (await apiClient.settings.update(settings as unknown as Record<string, unknown>)) as UserSettingsData;
      setSettings(updated);
      setOriginal(updated);
      toast({ title: "Đã lưu cài đặt", description: "Tùy chọn học tập đã được cập nhật." });
    } catch {
      toast({ title: "Không thể lưu cài đặt", description: "Vui lòng thử lại.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(original);
    toast({ title: "Đã hoàn tác", description: "Cài đặt quay về lần lưu gần nhất." });
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(original);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-12 w-12 rounded-full border-4 border-violet-100 border-t-violet-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1380px]">
        <PageHeader
          action={
            <div className="flex gap-2">
              <Button className="rounded-2xl border-white/80 bg-white/90 text-slate-700 hover:bg-white" onClick={handleReset} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button className="rounded-2xl bg-violet-500 text-white hover:bg-violet-400" disabled={!hasChanges || saving} onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          }
          eyebrow="Settings"
          icon={<Palette className="h-6 w-6 text-violet-600" />}
          title="Cài đặt"
          description="Mình gom các tùy chọn thành các cụm nhỏ, giúp bạn nhìn tổng quát mọi thiết lập mà không phải kéo sâu."
        />

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <MetricCard hint="Theme hiện tại" icon={<Palette className="h-4 w-4 text-violet-500" />} label="Giao diện" value={settings.theme} />
          <MetricCard hint="Mục tiêu cá nhân" icon={<Target className="h-4 w-4 text-amber-500" />} label="Daily goal" value={`${settings.dailyGoalMinutes} phút`} />
          <MetricCard hint="Trạng thái hệ thống" icon={<Bell className="h-4 w-4 text-sky-500" />} label="Thông báo" value={settings.notificationsEnabled ? "Bật" : "Tắt"} />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <PageSection title="Giao diện và ngôn ngữ" description="Các lựa chọn hiển thị chính được gom lại để đổi nhanh hơn.">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-[18px] border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <Palette className="h-5 w-5 text-violet-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Theme</p>
                    <p className="mt-1 text-sm text-slate-500">Chuyển giữa chế độ sáng, tối hoặc theo hệ thống.</p>
                  </div>
                </div>
                <Select onValueChange={(value) => update("theme", value)} value={settings.theme}>
                  <SelectTrigger className="h-11 w-[140px] rounded-2xl border-white/80 bg-white/90 text-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-[18px] border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-sky-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Ngôn ngữ giao diện</p>
                    <p className="mt-1 text-sm text-slate-500">Đổi ngôn ngữ hiển thị tổng thể của ứng dụng.</p>
                  </div>
                </div>
                <Select onValueChange={(value) => update("language", value)} value={settings.language}>
                  <SelectTrigger className="h-11 w-[160px] rounded-2xl border-white/80 bg-white/90 text-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PageSection>

          <PageSection title="Tùy chọn học tập" description="Bật/tắt nhanh các hỗ trợ đọc và âm thanh ngay trong một cụm gọn.">
            <div className="space-y-4">
              {[
                { key: "showFurigana", title: "Hiện furigana", description: "Bật gợi ý đọc phía trên kanji." },
                { key: "showRomaji", title: "Hiện romaji", description: "Hiện phiên âm Latin khi phù hợp." },
                { key: "autoPlayAudio", title: "Tự phát âm", description: "Phát audio khi xem từ vựng hoặc ví dụ." },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-[18px] border border-slate-200 bg-white p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                  </div>
                  <Switch
                    checked={settings[item.key as keyof UserSettingsData] as boolean}
                    onCheckedChange={(value) => update(item.key as keyof UserSettingsData, value)}
                  />
                </div>
              ))}
            </div>
          </PageSection>

          <PageSection title="Mục tiêu và độ khó" description="Các slider và selector được làm thấp hơn để không kéo trang quá dài.">
            <div className="space-y-5">
              <div className="rounded-[18px] border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-amber-500" />
                    <div>
                      <Label className="text-sm font-semibold text-slate-900">Mục tiêu hằng ngày</Label>
                      <p className="mt-1 text-sm text-slate-500">Điều chỉnh số phút học bạn muốn giữ đều mỗi ngày.</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-amber-700">{settings.dailyGoalMinutes} phút</span>
                </div>
                <Slider
                  className="w-full"
                  max={120}
                  min={5}
                  onValueChange={([value]) => update("dailyGoalMinutes", value)}
                  step={5}
                  value={[settings.dailyGoalMinutes]}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[18px] border border-slate-200 bg-white p-4">
                  <Label className="mb-2 block text-sm font-semibold text-slate-900">Mục tiêu JLPT</Label>
                  <Select onValueChange={(value) => update("targetJlptLevel", value)} value={settings.targetJlptLevel}>
                    <SelectTrigger className="h-11 rounded-2xl border-white/80 bg-white/90 text-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["N5", "N4", "N3", "N2", "N1"].map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-[18px] border border-slate-200 bg-white p-4">
                  <Label className="mb-2 block text-sm font-semibold text-slate-900">Độ khó quiz</Label>
                  <Select onValueChange={(value) => update("quizDifficulty", value)} value={settings.quizDifficulty}>
                    <SelectTrigger className="h-11 rounded-2xl border-white/80 bg-white/90 text-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </PageSection>

          <PageSection title="Thông báo" description="Không đẩy thành một màn hình riêng nữa, chỉ giữ phần thực sự cần thiết.">
            <div className="flex items-center justify-between rounded-[18px] border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-sky-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Nhắc học mỗi ngày</p>
                  <p className="mt-1 text-sm text-slate-500">Bật để nhận nhắc nhở giữ nhịp học đều.</p>
                </div>
              </div>
              <Switch checked={settings.notificationsEnabled} onCheckedChange={(value) => update("notificationsEnabled", value)} />
            </div>
          </PageSection>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
