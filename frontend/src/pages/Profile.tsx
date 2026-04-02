import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarClock,
  Flame,
  Globe,
  GraduationCap,
  KeyRound,
  LogOut,
  Palette,
  RotateCcw,
  Save,
  Settings2,
  Shield,
  Target,
  UserRound,
  Volume2,
} from "lucide-react";
import { authApi, settingsApi, type UpdateUserSettingsPayload, type UserSettingsResponse } from "@/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface UserSettingsData {
  theme: string;
  language: string;
  dailyGoalMinutes: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
  showFurigana: boolean;
  showRomaji: boolean;
  autoPlayAudio: boolean;
  quizDifficulty: string;
  targetJlptLevel: string;
  jlptDeadlineDate: string | null;
}

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const DEFAULT_SETTINGS: UserSettingsData = {
  theme: "light",
  language: "vi",
  dailyGoalMinutes: 30,
  emailNotifications: true,
  pushNotifications: true,
  showFurigana: true,
  showRomaji: true,
  autoPlayAudio: false,
  quizDifficulty: "normal",
  targetJlptLevel: "N5",
  jlptDeadlineDate: null,
};

const EMPTY_PASSWORD_FORM: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const normalizeSettings = (data: UserSettingsResponse): UserSettingsData => ({
  ...DEFAULT_SETTINGS,
  ...data,
  quizDifficulty: (data.quizDifficulty || DEFAULT_SETTINGS.quizDifficulty).toLowerCase(),
  jlptDeadlineDate: data.jlptDeadlineDate ?? null,
});

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [settings, setSettings] = useState<UserSettingsData>(DEFAULT_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState<UserSettingsData>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(EMPTY_PASSWORD_FORM);

  const fetchPageData = useCallback(async () => {
    setLoading(true);
    try {
      const settingsResponse = await settingsApi.get();
      const normalized = normalizeSettings(settingsResponse);
      setSettings(normalized);
      setOriginalSettings(normalized);
    } catch {
      setSettings(DEFAULT_SETTINGS);
      setOriginalSettings(DEFAULT_SETTINGS);
      toast({
        title: "Khong tai duoc cai dat",
        description: "Trang van mo duoc, nhung mot so du lieu co the chua moi nhat.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    setDisplayName(user?.displayName ?? "");
  }, [user?.displayName]);

  useEffect(() => {
    void fetchPageData();
  }, [fetchPageData]);

  const updateSetting = (key: keyof UserSettingsData, value: string | number | boolean | null) => {
    setSettings((previous) => ({ ...previous, [key]: value }));
  };

  const hasSettingsChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);
  const hasProfileChanges = displayName.trim() !== (user?.displayName ?? "").trim();
  const notificationsEnabled = settings.emailNotifications || settings.pushNotifications;
  const userInitial = (user?.displayName?.trim()?.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase();

  const deadlineMeta = useMemo(() => {
    if (!settings.jlptDeadlineDate) {
      return null;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const deadline = new Date(`${settings.jlptDeadlineDate}T00:00:00`);
    if (Number.isNaN(deadline.getTime())) {
      return null;
    }

    const daysRemaining = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return {
      daysRemaining,
      isPast: daysRemaining <= 0,
    };
  }, [settings.jlptDeadlineDate]);

  const handleSaveProfile = async () => {
    const nextDisplayName = displayName.trim();
    if (!nextDisplayName) {
      toast({ title: "Thieu ten hien thi", description: "Vui long nhap ten hien thi hop le.", variant: "destructive" });
      return;
    }

    setProfileSaving(true);
    try {
      await authApi.updateProfile({ displayName: nextDisplayName });
      await refreshUser();
      toast({ title: "Da cap nhat ho so", description: "Ten hien thi cua ban da duoc luu." });
    } catch (error) {
      toast({
        title: "Khong the cap nhat ho so",
        description: error instanceof Error ? error.message : "Vui long thu lai.",
        variant: "destructive",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      const payload: UpdateUserSettingsPayload = {
        ...settings,
        jlptDeadlineDate: settings.jlptDeadlineDate ? settings.jlptDeadlineDate : "",
      };
      const updated = await settingsApi.update(payload);
      const normalized = normalizeSettings(updated);
      setSettings(normalized);
      setOriginalSettings(normalized);
      toast({ title: "Da luu cai dat", description: "Thiet lap hoc tap va giao dien da duoc cap nhat." });
    } catch (error) {
      toast({
        title: "Khong the luu cai dat",
        description: error instanceof Error ? error.message : "Vui long thu lai.",
        variant: "destructive",
      });
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleResetSettings = () => {
    setSettings(originalSettings);
    toast({ title: "Da hoan tac", description: "Cai dat quay ve lan luu gan nhat." });
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({ title: "Thieu thong tin", description: "Vui long dien du cac truong mat khau.", variant: "destructive" });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Mat khau chua khop", description: "Mat khau moi va xac nhan mat khau phai giong nhau.", variant: "destructive" });
      return;
    }

    setPasswordSaving(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm(EMPTY_PASSWORD_FORM);
      toast({ title: "Doi mat khau thanh cong", description: "Mat khau tai khoan cua ban da duoc cap nhat." });
    } catch (error) {
      toast({
        title: "Khong the doi mat khau",
        description: error instanceof Error ? error.message : "Vui long thu lai.",
        variant: "destructive",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-100 border-t-sky-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1380px]">
        <PageHeader
          eyebrow="Account"
          icon={<Settings2 className="h-6 w-6 text-sky-600" />}
          title="Tai khoan"
          description="Mot noi de quan ly ho so, bao mat va toan bo cai dat hoc tap cua ban."
          action={
            <div className="flex flex-wrap gap-2">
              <Button className="rounded-2xl border-border bg-card text-foreground/80 hover:bg-card" onClick={handleResetSettings} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Hoan tac cai dat
              </Button>
              <Button className="rounded-2xl bg-sky-500 text-white hover:bg-sky-400" disabled={!hasSettingsChanges || settingsSaving} onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                {settingsSaving ? "Dang luu..." : "Luu cai dat"}
              </Button>
            </div>
          }
        />

        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <MetricCard hint="Ten hien thi hien tai" icon={<UserRound className="h-4 w-4 text-sky-500" />} label="Ho so" value={user?.displayName || "User"} />
          <MetricCard hint="Muc tieu chinh" icon={<GraduationCap className="h-4 w-4 text-amber-500" />} label="JLPT" value={settings.targetJlptLevel} />
          <MetricCard hint="Muc tieu hoc moi ngay" icon={<Target className="h-4 w-4 text-emerald-500" />} label="Daily goal" value={`${settings.dailyGoalMinutes} phut`} />
          <MetricCard hint="Trang thai thong bao" icon={<Bell className="h-4 w-4 text-violet-500" />} label="Thong bao" value={notificationsEnabled ? "Bat" : "Tat"} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="space-y-4">
            <PageSection title="Tom tat tai khoan" description="Cac thong tin chinh de ban kiem tra nhanh truoc khi chinh sua.">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 bg-[linear-gradient(135deg,#7dd3fc,#86efac)]">
                  <AvatarFallback className="bg-transparent text-xl font-semibold text-foreground">{userInitial}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-foreground">{user?.displayName || "Learner"}</p>
                  <p className="truncate text-sm text-muted-foreground">{user?.email || "user@example.com"}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(user?.roles || ["USER"]).map((role) => (
                      <Badge key={role} className="rounded-full border border-sky-200 bg-sky-50 text-sky-700">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[20px] border border-emerald-200 bg-emerald-50/70 p-4">
                <p className="text-sm font-semibold text-emerald-800">Nhip hoc hien tai</p>
                <p className="mt-1 text-sm leading-6 text-foreground/80">
                  Ban dang huong toi {settings.targetJlptLevel} voi muc tieu {settings.dailyGoalMinutes} phut moi ngay va
                  che do quiz {settings.quizDifficulty}.
                </p>
              </div>

              <div className="mt-4 rounded-[20px] border border-amber-200 bg-amber-50/70 p-4">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-amber-600" />
                  <p className="text-sm font-semibold text-amber-800">Goi y nhanh</p>
                </div>
                <p className="mt-1 text-sm leading-6 text-foreground/80">
                  Neu ban muon doi toan bo trai nghiem ca nhan, hay chinh ten hien thi o phan ho so va luu cai dat hoc tap
                  o cung trang nay.
                </p>
              </div>

              <Button className="mt-4 w-full rounded-2xl border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100" onClick={handleLogout} variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Dang xuat
              </Button>
            </PageSection>
          </div>

          <div className="space-y-4">
            <PageSection
              title="Ho so ca nhan"
              description="Cap nhat ten hien thi va kiem tra thong tin tai khoan co ban."
              action={
                <Button className="rounded-2xl bg-sky-500 text-white hover:bg-sky-400" disabled={!hasProfileChanges || profileSaving} onClick={handleSaveProfile}>
                  <Save className="mr-2 h-4 w-4" />
                  {profileSaving ? "Dang luu..." : "Luu ho so"}
                </Button>
              }
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Ten hien thi</Label>
                  <Input
                    id="displayName"
                    className="h-11 rounded-2xl border-border bg-card"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Nhap ten hien thi cua ban"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" className="h-11 rounded-2xl border-border bg-muted" value={user?.email || ""} disabled />
                </div>
              </div>
            </PageSection>

            <PageSection
              title="Bao mat"
              description="Doi mat khau ngay tai day ma khong can sang man hinh khac."
              action={
                <Button className="rounded-2xl bg-emerald-500 text-white hover:bg-emerald-400" disabled={passwordSaving} onClick={handleChangePassword}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  {passwordSaving ? "Dang cap nhat..." : "Doi mat khau"}
                </Button>
              }
            >
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mat khau hien tai</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    className="h-11 rounded-2xl border-border bg-card"
                    value={passwordForm.currentPassword}
                    onChange={(event) => setPasswordForm((previous) => ({ ...previous, currentPassword: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mat khau moi</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    className="h-11 rounded-2xl border-border bg-card"
                    value={passwordForm.newPassword}
                    onChange={(event) => setPasswordForm((previous) => ({ ...previous, newPassword: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xac nhan mat khau</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="h-11 rounded-2xl border-border bg-card"
                    value={passwordForm.confirmPassword}
                    onChange={(event) => setPasswordForm((previous) => ({ ...previous, confirmPassword: event.target.value }))}
                  />
                </div>
              </div>
            </PageSection>

            <div className="grid gap-4 xl:grid-cols-2">
              <PageSection title="Giao dien va ngon ngu" description="Chinh cam giac dung app va ngon ngu hien thi o cung mot cum.">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-[18px] border border-border bg-card p-4">
                    <div className="flex items-center gap-3">
                      <Palette className="h-5 w-5 text-violet-500" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Theme</p>
                        <p className="mt-1 text-sm text-muted-foreground">Chuyen giua light, dark hoac system.</p>
                      </div>
                    </div>
                    <Select onValueChange={(value) => updateSetting("theme", value)} value={settings.theme}>
                      <SelectTrigger className="h-11 w-[140px] rounded-2xl border-border bg-card text-foreground/80">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-[18px] border border-border bg-card p-4">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-sky-500" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Ngon ngu giao dien</p>
                        <p className="mt-1 text-sm text-muted-foreground">Doi ngon ngu hien thi tong the cua ung dung.</p>
                      </div>
                    </div>
                    <Select onValueChange={(value) => updateSetting("language", value)} value={settings.language}>
                      <SelectTrigger className="h-11 w-[160px] rounded-2xl border-border bg-card text-foreground/80">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vi">Tieng Viet</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PageSection>

              <PageSection title="Thong bao" description="Dieu khien thong bao email va push ngay trong cung trang tai khoan.">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-[18px] border border-border bg-card p-4">
                    <div className="flex items-center gap-3">
                      <Volume2 className="h-5 w-5 text-sky-500" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Email notifications</p>
                        <p className="mt-1 text-sm text-muted-foreground">Nhan tong ket va nhac nho qua email.</p>
                      </div>
                    </div>
                    <Switch checked={settings.emailNotifications} onCheckedChange={(value) => updateSetting("emailNotifications", value)} />
                  </div>

                  <div className="flex items-center justify-between rounded-[18px] border border-border bg-card p-4">
                    <div className="flex items-center gap-3">
                      <CalendarClock className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Push notifications</p>
                        <p className="mt-1 text-sm text-muted-foreground">Nhac gio hoc truc tiep tren thiet bi.</p>
                      </div>
                    </div>
                    <Switch checked={settings.pushNotifications} onCheckedChange={(value) => updateSetting("pushNotifications", value)} />
                  </div>
                </div>
              </PageSection>
            </div>

            <PageSection title="Tuy chon hoc tap" description="Tat ca ho tro doc, am thanh, muc tieu va do kho hoc tap duoc gom ve mot cho.">
              <div className="space-y-5">
                <div className="grid gap-4 xl:grid-cols-2">
                  {[
                    { key: "showFurigana", title: "Hien furigana", description: "Bat goi y doc phia tren kanji." },
                    { key: "showRomaji", title: "Hien romaji", description: "Hien phien am Latin khi phu hop." },
                    { key: "autoPlayAudio", title: "Tu phat am", description: "Phat audio khi xem tu vung hoac vi du." },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between rounded-[18px] border border-border bg-card p-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch
                        checked={settings[item.key as keyof UserSettingsData] as boolean}
                        onCheckedChange={(value) => updateSetting(item.key as keyof UserSettingsData, value)}
                      />
                    </div>
                  ))}
                </div>

                <div className="rounded-[18px] border border-border bg-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-amber-500" />
                      <div>
                        <Label className="text-sm font-semibold text-foreground">Muc tieu hang ngay</Label>
                        <p className="mt-1 text-sm text-muted-foreground">Chinh so phut hoc ban muon giu deu moi ngay.</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-amber-700">{settings.dailyGoalMinutes} phut</span>
                  </div>
                  <Slider
                    className="w-full"
                    max={120}
                    min={5}
                    onValueChange={([value]) => updateSetting("dailyGoalMinutes", value)}
                    step={5}
                    value={[settings.dailyGoalMinutes]}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[18px] border border-border bg-card p-4">
                    <Label className="mb-2 block text-sm font-semibold text-foreground">Muc tieu JLPT</Label>
                    <Select onValueChange={(value) => updateSetting("targetJlptLevel", value)} value={settings.targetJlptLevel}>
                      <SelectTrigger className="h-11 rounded-2xl border-border bg-card text-foreground/80">
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

                  <div className="rounded-[18px] border border-border bg-card p-4">
                    <Label className="mb-2 block text-sm font-semibold text-foreground">Deadline JLPT</Label>
                    <Input
                      type="date"
                      className="h-11 rounded-2xl border-border bg-card text-foreground/80"
                      value={settings.jlptDeadlineDate ?? ""}
                      onChange={(event) => updateSetting("jlptDeadlineDate", event.target.value || null)}
                    />
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {deadlineMeta
                          ? deadlineMeta.isPast
                            ? "Deadline da qua. Hay doi lich moi de tinh ke hoach chinh xac."
                            : `Con ${deadlineMeta.daysRemaining} ngay den han.`
                          : "Chua dat deadline. Ke hoach se dua tren daily goal."}
                      </span>
                      {settings.jlptDeadlineDate && (
                        <button
                          type="button"
                          className="font-medium text-primary"
                          onClick={() => updateSetting("jlptDeadlineDate", null)}
                        >
                          Xoa
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-border bg-card p-4">
                    <Label className="mb-2 block text-sm font-semibold text-foreground">Do kho quiz</Label>
                    <Select onValueChange={(value) => updateSetting("quizDifficulty", value)} value={settings.quizDifficulty}>
                      <SelectTrigger className="h-11 rounded-2xl border-border bg-card text-foreground/80">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-5 w-5 text-slate-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Luu y</p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        Moi thay doi ve cai dat hoc tap, giao dien va thong bao duoc luu bang nut "Luu cai dat" o dau trang.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </PageSection>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
