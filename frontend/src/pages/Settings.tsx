import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon, Moon, Sun, Bell, BellOff, Globe, Target,
  Volume2, VolumeX, BookOpen, GraduationCap, Save, RotateCcw, Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/layout/DashboardLayout";
import WinterNightBackground from "@/components/WinterNightBackground";
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen relative">
        <WinterNightBackground snowCount={20} sparkleCount={10} intensity="light" />
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-3xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
                  <SettingsIcon className="w-8 h-8 text-violet-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Cài đặt 設定
                  </h1>
                  <p className="text-muted-foreground">Tùy chỉnh trải nghiệm học tập</p>
                </div>
              </div>
              {hasChanges && (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={handleReset}><RotateCcw className="w-4 h-4 mr-1" /> Reset</Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <><Save className="w-4 h-4 mr-1" /> Lưu</>}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          <div className="space-y-6">
            {/* Appearance */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Card className="bg-card/40 backdrop-blur-md border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5 text-violet-400" /> Giao diện</CardTitle>
                  <CardDescription>Theme và ngôn ngữ hiển thị</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {settings.theme === "dark" ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                      <div>
                        <Label className="text-sm font-medium">Theme</Label>
                        <p className="text-xs text-muted-foreground">Chế độ sáng / tối</p>
                      </div>
                    </div>
                    <Select value={settings.theme} onValueChange={(v) => update("theme", v)}>
                      <SelectTrigger className="w-[120px] bg-background/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">🌙 Dark</SelectItem>
                        <SelectItem value="light">☀️ Light</SelectItem>
                        <SelectItem value="system">💻 System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-cyan-400" />
                      <div>
                        <Label className="text-sm font-medium">Ngôn ngữ</Label>
                        <p className="text-xs text-muted-foreground">Ngôn ngữ hiển thị giao diện</p>
                      </div>
                    </div>
                    <Select value={settings.language} onValueChange={(v) => update("language", v)}>
                      <SelectTrigger className="w-[140px] bg-background/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vi">🇻🇳 Tiếng Việt</SelectItem>
                        <SelectItem value="en">🇬🇧 English</SelectItem>
                        <SelectItem value="ja">🇯🇵 日本語</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Learning */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-card/40 backdrop-blur-md border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-emerald-400" /> Học tập</CardTitle>
                  <CardDescription>Cài đặt hiển thị và luyện tập</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Hiện Furigana</Label>
                      <p className="text-xs text-muted-foreground">Hiện chữ đọc bên trên Kanji</p>
                    </div>
                    <Switch checked={settings.showFurigana} onCheckedChange={(v) => update("showFurigana", v)} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Hiện Romaji</Label>
                      <p className="text-xs text-muted-foreground">Hiện phiên âm Latin</p>
                    </div>
                    <Switch checked={settings.showRomaji} onCheckedChange={(v) => update("showRomaji", v)} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {settings.autoPlayAudio ? <Volume2 className="w-5 h-5 text-green-400" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
                      <div>
                        <Label className="text-sm font-medium">Tự động phát âm</Label>
                        <p className="text-xs text-muted-foreground">Phát âm khi xem từ vựng</p>
                      </div>
                    </div>
                    <Switch checked={settings.autoPlayAudio} onCheckedChange={(v) => update("autoPlayAudio", v)} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Goals */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="bg-card/40 backdrop-blur-md border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-orange-400" /> Mục tiêu</CardTitle>
                  <CardDescription>Đặt mục tiêu học tập cá nhân</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">Mục tiêu hàng ngày</Label>
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
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>5 phút</span><span>60 phút</span><span>120 phút</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-cyan-400" />
                      <div>
                        <Label className="text-sm font-medium">Mục tiêu JLPT</Label>
                        <p className="text-xs text-muted-foreground">Level bạn muốn đạt được</p>
                      </div>
                    </div>
                    <Select value={settings.targetJlptLevel} onValueChange={(v) => update("targetJlptLevel", v)}>
                      <SelectTrigger className="w-[100px] bg-background/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["N5", "N4", "N3", "N2", "N1"].map(l => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Độ khó Quiz</Label>
                      <p className="text-xs text-muted-foreground">Mức độ khó của câu hỏi</p>
                    </div>
                    <Select value={settings.quizDifficulty} onValueChange={(v) => update("quizDifficulty", v)}>
                      <SelectTrigger className="w-[120px] bg-background/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EASY">🟢 Dễ</SelectItem>
                        <SelectItem value="MEDIUM">🟡 Trung bình</SelectItem>
                        <SelectItem value="HARD">🔴 Khó</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notifications */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-card/40 backdrop-blur-md border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {settings.notificationsEnabled ? <Bell className="w-5 h-5 text-yellow-400" /> : <BellOff className="w-5 h-5 text-muted-foreground" />}
                    Thông báo
                  </CardTitle>
                  <CardDescription>Quản lý thông báo nhắc nhở</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Bật thông báo</Label>
                      <p className="text-xs text-muted-foreground">Nhận nhắc nhở học tập hàng ngày</p>
                    </div>
                    <Switch checked={settings.notificationsEnabled} onCheckedChange={(v) => update("notificationsEnabled", v)} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Floating Save */}
          <AnimatedSaveBtn visible={hasChanges} onSave={handleSave} saving={saving} />
        </div>
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
      <Button size="lg" onClick={onSave} disabled={saving} className="shadow-lg shadow-primary/25">
        {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" /> : <Save className="w-5 h-5 mr-2" />}
        Lưu thay đổi
      </Button>
    </motion.div>
  );
};

export default Settings;
