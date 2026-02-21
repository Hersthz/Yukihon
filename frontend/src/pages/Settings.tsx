import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon, Moon, Sun, Bell, BellOff, Globe, Target,
  Volume2, VolumeX, BookOpen, GraduationCap, Save, RotateCcw, Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import DashboardLayout from "@/components/layout/DashboardLayout";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

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
  theme: "dark",
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
      const data = await apiClient.settings.get() as UserSettingsData;
      setSettings(data);
      setOriginal(data);
    } catch {
      // Use defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await apiClient.settings.update(settings as unknown as Record<string, unknown>) as UserSettingsData;
      setSettings(updated);
      setOriginal(updated);
      toast({ title: "Saved! ✅", description: "Cài đặt đã được lưu thành công" });
    } catch {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(original);
    toast({ title: "Reset", description: "Settings reverted to last saved state" });
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(original);

  const update = (key: keyof UserSettingsData, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="relative w-12 h-12">
            <motion.div className="absolute inset-0 rounded-full border-2 border-violet-500/20" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
            <motion.div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-400" animate={{ rotate: -360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20">
                  <SettingsIcon className="w-7 h-7 text-violet-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Cài đặt 設定</h1>
                  <p className="text-sm text-slate-400">Tùy chỉnh trải nghiệm học tập</p>
                </div>
              </div>
              {hasChanges && (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={handleReset} className="text-slate-400 hover:text-white"><RotateCcw className="w-4 h-4 mr-1" /> Reset</Button>
                  <Button onClick={handleSave} disabled={saving} className="bg-white/[0.06] hover:bg-violet-500/15 text-white border border-white/[0.08] hover:border-violet-500/30 transition-all">
                    {saving ? <div className="relative w-4 h-4 mr-1"><motion.div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} /></div> : <><Save className="w-4 h-4 mr-1" /> Lưu</>}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          <div className="space-y-6">
            {/* Appearance */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
                <div className="h-0.5 bg-gradient-to-r from-violet-500/40 to-purple-500/40" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <Palette className="w-5 h-5 text-violet-400" />
                    <h3 className="text-base font-bold text-white">Giao diện</h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-5">Theme và ngôn ngữ hiển thị</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-white/[0.04]">
                      <div className="flex items-center gap-3">
                        {settings.theme === "dark" ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
                        <div>
                          <Label className="text-sm text-white">Theme</Label>
                          <p className="text-xs text-slate-500">Chế độ sáng / tối</p>
                        </div>
                      </div>
                      <Select value={settings.theme} onValueChange={(v) => update("theme", v)}>
                        <SelectTrigger className="w-[120px] bg-white/[0.03] border-white/[0.06] text-white text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dark">🌙 Dark</SelectItem>
                          <SelectItem value="light">☀️ Light</SelectItem>
                          <SelectItem value="system">💻 System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-cyan-400" />
                        <div>
                          <Label className="text-sm text-white">Ngôn ngữ</Label>
                          <p className="text-xs text-slate-500">Ngôn ngữ hiển thị giao diện</p>
                        </div>
                      </div>
                      <Select value={settings.language} onValueChange={(v) => update("language", v)}>
                        <SelectTrigger className="w-[140px] bg-white/[0.03] border-white/[0.06] text-white text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vi">🇻🇳 Tiếng Việt</SelectItem>
                          <SelectItem value="en">🇬🇧 English</SelectItem>
                          <SelectItem value="ja">🇯🇵 日本語</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Learning */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
                <div className="h-0.5 bg-gradient-to-r from-emerald-500/40 to-teal-500/40" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-bold text-white">Học tập</h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-5">Cài đặt hiển thị và luyện tập</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-white/[0.04]">
                      <div>
                        <Label className="text-sm text-white">Hiện Furigana</Label>
                        <p className="text-xs text-slate-500">Hiện chữ đọc bên trên Kanji</p>
                      </div>
                      <Switch checked={settings.showFurigana} onCheckedChange={(v) => update("showFurigana", v)} />
                    </div>
                    <div className="flex items-center justify-between pb-4 border-b border-white/[0.04]">
                      <div>
                        <Label className="text-sm text-white">Hiện Romaji</Label>
                        <p className="text-xs text-slate-500">Hiện phiên âm Latin</p>
                      </div>
                      <Switch checked={settings.showRomaji} onCheckedChange={(v) => update("showRomaji", v)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {settings.autoPlayAudio ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
                        <div>
                          <Label className="text-sm text-white">Tự động phát âm</Label>
                          <p className="text-xs text-slate-500">Phát âm khi xem từ vựng</p>
                        </div>
                      </div>
                      <Switch checked={settings.autoPlayAudio} onCheckedChange={(v) => update("autoPlayAudio", v)} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Goals */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
                <div className="h-0.5 bg-gradient-to-r from-orange-500/40 to-amber-500/40" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-5 h-5 text-orange-400" />
                    <h3 className="text-base font-bold text-white">Mục tiêu</h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-5">Đặt mục tiêu học tập cá nhân</p>
                  <div className="space-y-5">
                    <div className="pb-5 border-b border-white/[0.04]">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm text-white">Mục tiêu hàng ngày</Label>
                        <span className="text-sm font-bold text-orange-400">{settings.dailyGoalMinutes} phút</span>
                      </div>
                      <Slider
                        value={[settings.dailyGoalMinutes]}
                        onValueChange={([v]) => update("dailyGoalMinutes", v)}
                        max={120}
                        min={5}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-600 mt-1">
                        <span>5 phút</span><span>60 phút</span><span>120 phút</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pb-5 border-b border-white/[0.04]">
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-5 h-5 text-cyan-400" />
                        <div>
                          <Label className="text-sm text-white">Mục tiêu JLPT</Label>
                          <p className="text-xs text-slate-500">Level bạn muốn đạt được</p>
                        </div>
                      </div>
                      <Select value={settings.targetJlptLevel} onValueChange={(v) => update("targetJlptLevel", v)}>
                        <SelectTrigger className="w-[100px] bg-white/[0.03] border-white/[0.06] text-white text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["N5", "N4", "N3", "N2", "N1"].map(l => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm text-white">Độ khó Quiz</Label>
                        <p className="text-xs text-slate-500">Mức độ khó của câu hỏi</p>
                      </div>
                      <Select value={settings.quizDifficulty} onValueChange={(v) => update("quizDifficulty", v)}>
                        <SelectTrigger className="w-[130px] bg-white/[0.03] border-white/[0.06] text-white text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EASY">🟢 Dễ</SelectItem>
                          <SelectItem value="MEDIUM">🟡 Trung bình</SelectItem>
                          <SelectItem value="HARD">🔴 Khó</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
                <div className="h-0.5 bg-gradient-to-r from-amber-500/40 to-yellow-500/40" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-1">
                    {settings.notificationsEnabled ? <Bell className="w-5 h-5 text-amber-400" /> : <BellOff className="w-5 h-5 text-slate-500" />}
                    <h3 className="text-base font-bold text-white">Thông báo</h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-5">Quản lý thông báo nhắc nhở</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm text-white">Bật thông báo</Label>
                      <p className="text-xs text-slate-500">Nhận nhắc nhở học tập hàng ngày</p>
                    </div>
                    <Switch checked={settings.notificationsEnabled} onCheckedChange={(v) => update("notificationsEnabled", v)} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Floating Save */}
          <AnimatedSaveBtn visible={hasChanges} onSave={handleSave} saving={saving} />
        </div>
    </DashboardLayout>
  );
};

const AnimatedSaveBtn = ({ visible, onSave, saving }: { visible: boolean; onSave: () => void; saving: boolean }) => {
  if (!visible) return null;
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Button size="lg" onClick={onSave} disabled={saving} className="bg-white/[0.08] hover:bg-violet-500/20 text-white border border-white/[0.1] hover:border-violet-500/30 shadow-lg shadow-black/20 transition-all">
        {saving ? <div className="relative w-4 h-4 mr-2"><motion.div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} /></div> : <Save className="w-5 h-5 mr-2" />}
        Lưu thay đổi
      </Button>
    </motion.div>
  );
};

export default Settings;
