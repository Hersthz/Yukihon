import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  GraduationCap,
  KeyRound,
  LogOut,
  Palette,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  Target,
  UserRound,
  Volume2,
} from "lucide-react";
import {
  authApi,
  settingsApi,
  type UpdateUserSettingsPayload,
  type UserSettingsResponse,
} from "@/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
const normalize = (data: UserSettingsResponse): UserSettingsData => ({
  ...DEFAULT_SETTINGS,
  ...data,
  theme: "light",
  language: data.language || "vi",
  quizDifficulty: (data.quizDifficulty || "normal").toLowerCase(),
  jlptDeadlineDate: data.jlptDeadlineDate ?? null,
});
const diffCount = (a: UserSettingsData, b: UserSettingsData) =>
  Object.keys(a).filter(
    (key) => a[key as keyof UserSettingsData] !== b[key as keyof UserSettingsData]
  ).length;
const strength = (value: string) => {
  let score = 0;
  if (value.length >= 8) score += 35;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 25;
  if (/\d/.test(value)) score += 20;
  if (/[^A-Za-z0-9]/.test(value)) score += 20;
  return {
    score,
    label: score >= 80 ? "Manh" : score >= 50 ? "Kha on" : value ? "Con yeu" : "Chua nhap",
    tone: score >= 80 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-rose-600",
  };
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
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
      const next = normalize(await settingsApi.get());
      setSettings(next);
      setOriginalSettings(next);
    } catch {
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
  useEffect(() => {
    if (!loading) setTheme("light");
  }, [loading, setTheme, settings.theme]);
  useEffect(() => () => setTheme("light"), [originalSettings.theme, setTheme]);

  const setField = (key: keyof UserSettingsData, value: string | number | boolean | null) =>
    setSettings((prev) => ({ ...prev, [key]: value }));
  const name = displayName.trim();
  const nameError = !name
    ? "Ten hien thi khong duoc de trong."
    : name.length < 2
      ? "Ten hien thi nen tu 2 ky tu tro len."
      : name.length > 50
        ? "Ten hien thi nen duoi 50 ky tu."
        : null;
  const hasProfileChanges = name !== (user?.displayName ?? "").trim();
  const settingsChanges = diffCount(settings, originalSettings);
  const hasSettingsChanges = settingsChanges > 0;
  const pwd = strength(passwordForm.newPassword);
  const passwordError =
    !passwordForm.currentPassword && !passwordForm.newPassword && !passwordForm.confirmPassword
      ? null
      : !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword
        ? "Can dien day du 3 truong mat khau."
        : passwordForm.newPassword.length < 8
          ? "Mat khau moi can it nhat 8 ky tu."
          : passwordForm.newPassword === passwordForm.currentPassword
            ? "Mat khau moi can khac mat khau hien tai."
            : passwordForm.newPassword !== passwordForm.confirmPassword
              ? "Xac nhan mat khau chua khop."
              : null;
  const deadlineText = useMemo(() => {
    if (!settings.jlptDeadlineDate) return "Chua dat deadline.";
    const today = new Date();
    const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const deadline = new Date(`${settings.jlptDeadlineDate}T00:00:00`);
    const diff = Math.round((deadline.getTime() - base.getTime()) / 86400000);
    if (Number.isNaN(diff)) return "Deadline chua hop le.";
    if (diff < 0) return "Deadline da qua.";
    if (diff === 0) return "Hom nay la deadline.";
    return `Con ${diff} ngay den han.`;
  }, [settings.jlptDeadlineDate]);

  const saveProfile = async () => {
    if (nameError || !hasProfileChanges) {
      if (nameError)
        toast({ title: "Thong tin chua hop le", description: nameError, variant: "destructive" });
      return;
    }
    setProfileSaving(true);
    try {
      await authApi.updateProfile({ displayName: name });
      await refreshUser();
      toast({ title: "Da cap nhat ho so", description: "Ten hien thi da duoc luu." });
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

  const saveSettings = async () => {
    setSettingsSaving(true);
    try {
      const payload: UpdateUserSettingsPayload = {
        ...settings,
        jlptDeadlineDate: settings.jlptDeadlineDate || "",
      };
      const next = normalize(await settingsApi.update(payload));
      setSettings(next);
      setOriginalSettings(next);
      toast({
        title: "Da luu cai dat",
        description: "Trai nghiem hoc tap cua ban da duoc cap nhat.",
      });
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

  const savePassword = async () => {
    if (passwordError) {
      toast({
        title: "Khong the doi mat khau",
        description: passwordError,
        variant: "destructive",
      });
      return;
    }
    setPasswordSaving(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm(EMPTY_PASSWORD_FORM);
      toast({ title: "Doi mat khau thanh cong", description: "Mat khau moi da co hieu luc ngay." });
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

  if (loading)
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-100 border-t-sky-500" />
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1420px]">
        <PageHeader
          eyebrow="Account hub"
          icon={<Settings2 className="h-6 w-6 text-sky-600" />}
          title="Tai khoan va cai dat"
          description="Mot noi duy nhat de quan ly ho so, bao mat va nhung tuy chinh giup viec tu hoc muot hon."
          action={
            <div className="flex flex-wrap gap-2">
              <Badge
                className={cn(
                  "rounded-full border px-3 py-1",
                  hasProfileChanges || hasSettingsChanges
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                )}
              >
                {hasProfileChanges || hasSettingsChanges
                  ? "Dang co thay doi chua luu"
                  : "Tat ca da duoc luu"}
              </Badge>
              <Button
                variant="outline"
                className="rounded-2xl border-border bg-card text-foreground/80 hover:bg-card"
                onClick={() => setSettings(originalSettings)}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Hoan tac
              </Button>
              <Button
                className="rounded-2xl bg-sky-500 text-white hover:bg-sky-400"
                disabled={!hasSettingsChanges || settingsSaving}
                onClick={saveSettings}
              >
                <Save className="mr-2 h-4 w-4" />
                {settingsSaving ? "Dang luu..." : "Luu cai dat"}
              </Button>
            </div>
          }
        />
        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Trang thai"
            value={hasProfileChanges || hasSettingsChanges ? "Can luu" : "Da dong bo"}
            hint={
              hasProfileChanges || hasSettingsChanges
                ? "Co thay doi dang cho xu ly."
                : "Khong co thay doi nao dang cho."
            }
            icon={
              <CheckCircle2
                className={cn(
                  "h-4 w-4",
                  hasProfileChanges || hasSettingsChanges ? "text-amber-500" : "text-emerald-500"
                )}
              />
            }
          />
          <MetricCard
            label="JLPT"
            value={settings.targetJlptLevel}
            hint={deadlineText}
            icon={<GraduationCap className="h-4 w-4 text-amber-500" />}
          />
          <MetricCard
            label="Daily goal"
            value={`${settings.dailyGoalMinutes} phut`}
            hint={`${settings.quizDifficulty} quiz • ${settings.showFurigana ? "Co furigana" : "Khong furigana"}`}
            icon={<Target className="h-4 w-4 text-emerald-500" />}
          />
          <MetricCard
            label="Thong bao"
            value={
              settings.emailNotifications || settings.pushNotifications ? "Dang bat" : "Dang tat"
            }
            hint={
              settings.emailNotifications && settings.pushNotifications
                ? "Email va push"
                : settings.emailNotifications
                  ? "Chi email"
                  : settings.pushNotifications
                    ? "Chi push"
                    : "Tat het"
            }
            icon={<Bell className="h-4 w-4 text-violet-500" />}
          />
        </div>
        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <PageSection
            title="Tong quan"
            description="Nhin nhanh tinh trang account va trai nghiem hien tai."
            className="xl:sticky xl:top-[92px] xl:self-start"
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 bg-[linear-gradient(135deg,#7dd3fc,#86efac)]">
                <AvatarFallback className="bg-transparent text-xl font-semibold text-foreground">
                  {(user?.displayName?.[0] || user?.email?.[0] || "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-foreground">
                  {user?.displayName || "Learner"}
                </p>
                <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(user?.roles || ["USER"]).map((role) => (
                    <Badge
                      key={role}
                      className="rounded-full border border-sky-200 bg-sky-50 text-sky-700"
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-[18px] border border-border bg-card p-4 text-sm text-muted-foreground">
                Theme <span className="font-medium text-foreground">light</span> • hien thi{" "}
                <span className="font-medium capitalize text-foreground">{resolvedTheme}</span>
              </div>
              <div className="rounded-[18px] border border-border bg-card p-4 text-sm text-muted-foreground">
                Ngon ngu <span className="font-medium text-foreground">{settings.language}</span> •
                muc tieu{" "}
                <span className="font-medium text-foreground">{settings.targetJlptLevel}</span>
              </div>
              <div className="rounded-[18px] border border-emerald-200 bg-emerald-50/80 p-4 text-sm leading-6 text-foreground/80">
                Ban dang huong toi {settings.targetJlptLevel} voi muc tieu{" "}
                {settings.dailyGoalMinutes} phut moi ngay va {settings.quizDifficulty} quiz.
              </div>
            </div>
            <Button
              variant="outline"
              className="mt-4 w-full rounded-2xl border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
              onClick={() => {
                logout();
                navigate("/auth");
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Dang xuat
            </Button>
          </PageSection>
          <div className="space-y-4">
            <PageSection
              title="Ho so ca nhan"
              description="Cap nhat ten hien thi va giu thong tin account gon gang."
              action={
                <Button
                  className="rounded-2xl bg-sky-500 text-white hover:bg-sky-400"
                  disabled={!hasProfileChanges || !!nameError || profileSaving}
                  onClick={saveProfile}
                >
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
                    className={cn(
                      "h-11 rounded-2xl border-border bg-card",
                      nameError ? "border-rose-300" : ""
                    )}
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Nhap ten hien thi cua ban"
                  />
                  <p
                    className={cn("text-xs", nameError ? "text-rose-600" : "text-muted-foreground")}
                  >
                    {nameError || "Ten nay se hien o dashboard va cac khu vuc hoc tap."}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    className="h-11 rounded-2xl border-border bg-muted"
                    value={user?.email || ""}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Email hien chua doi trong man nay de tranh tac dong den dang nhap.
                  </p>
                </div>
              </div>
            </PageSection>
            <PageSection
              title="Hoc tap va trai nghiem"
              description="Tat ca preference hoc tap, thong bao va giao dien o cung mot cho."
            >
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-[18px] border border-border bg-card p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-amber-500" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Muc tieu hang ngay
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Dieu chinh nhip hoc theo muc tieu ca nhan.
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-amber-700">
                        {settings.dailyGoalMinutes} phut
                      </span>
                    </div>
                    <Slider
                      min={5}
                      max={120}
                      step={5}
                      value={[settings.dailyGoalMinutes]}
                      onValueChange={([value]) => setField("dailyGoalMinutes", value)}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-[18px] border border-border bg-card p-4">
                      <Label className="mb-2 block text-sm font-semibold text-foreground">
                        JLPT
                      </Label>
                      <Select
                        value={settings.targetJlptLevel}
                        onValueChange={(value) => setField("targetJlptLevel", value)}
                      >
                        <SelectTrigger className="h-11 rounded-2xl border-border bg-card">
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
                      <Label className="mb-2 block text-sm font-semibold text-foreground">
                        Theme
                      </Label>
                      <Select value="light" onValueChange={() => setField("theme", "light")}>
                        <SelectTrigger className="h-11 rounded-2xl border-border bg-card">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="rounded-[18px] border border-border bg-card p-4">
                      <Label className="mb-2 block text-sm font-semibold text-foreground">
                        Language
                      </Label>
                      <Select
                        value={settings.language}
                        onValueChange={(value) => setField("language", value)}
                      >
                        <SelectTrigger className="h-11 rounded-2xl border-border bg-card">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vi">Tieng Viet</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ja">Nihongo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      k: "emailNotifications",
                      t: "Email notifications",
                      d: "Nhan tong ket va nhac hoc qua email.",
                      i: Bell,
                    },
                    {
                      k: "pushNotifications",
                      t: "Push notifications",
                      d: "Nhac nhanh tren thiet bi.",
                      i: Volume2,
                    },
                    {
                      k: "showFurigana",
                      t: "Hien furigana",
                      d: "Bat goi y doc tren kanji.",
                      i: UserRound,
                    },
                    {
                      k: "showRomaji",
                      t: "Hien romaji",
                      d: "Them phien am Latin khi can.",
                      i: UserRound,
                    },
                    {
                      k: "autoPlayAudio",
                      t: "Tu phat audio",
                      d: "Phat am thanh khi mo the tu vung.",
                      i: Palette,
                    },
                  ].map((item) => {
                    const Icon = item.i;
                    return (
                      <div
                        key={item.k}
                        className="flex items-center justify-between rounded-[18px] border border-border bg-card p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{item.t}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{item.d}</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings[item.k as keyof UserSettingsData] as boolean}
                          onCheckedChange={(value) =>
                            setField(item.k as keyof UserSettingsData, value)
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </PageSection>
            <PageSection
              title="Bao mat"
              description="Doi mat khau ngay tai day voi huong dan ro rang."
              action={
                <Button
                  className="rounded-2xl bg-emerald-500 text-white hover:bg-emerald-400"
                  disabled={!!passwordError || passwordSaving}
                  onClick={savePassword}
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  {passwordSaving ? "Dang cap nhat..." : "Doi mat khau"}
                </Button>
              }
            >
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mat khau hien tai</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        className="h-11 rounded-2xl border-border bg-card"
                        value={passwordForm.currentPassword}
                        onChange={(event) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            currentPassword: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Mat khau moi</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        className="h-11 rounded-2xl border-border bg-card"
                        value={passwordForm.newPassword}
                        onChange={(event) =>
                          setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Xac nhan mat khau</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="h-11 rounded-2xl border-border bg-card"
                        value={passwordForm.confirmPassword}
                        onChange={(event) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            confirmPassword: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="rounded-[18px] border border-border bg-card p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">Do manh mat khau</p>
                      <span className={cn("text-sm font-semibold", pwd.tone)}>{pwd.label}</span>
                    </div>
                    <Progress value={pwd.score} className="h-2.5 bg-muted" />
                    <p
                      className={cn(
                        "mt-3 text-xs",
                        passwordError ? "text-rose-600" : "text-muted-foreground"
                      )}
                    >
                      {passwordError ||
                        "Uu tien mat khau du dai, co chu hoa, so va ky tu dac biet."}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-[18px] border border-emerald-200 bg-emerald-50/80 p-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                      <p className="text-sm font-semibold text-emerald-800">Tinh trang bao mat</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-foreground/80">
                      {passwordError
                        ? "Form doi mat khau can chinh lai truoc khi luu."
                        : "Moi thu da san sang, ban co the doi mat khau bat cu luc nao."}
                    </p>
                  </div>
                  <div className="rounded-[18px] border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">
                    Mat khau moi co hieu luc ngay. Neu ban dang hoc tren nhieu thiet bi, co the can
                    dang nhap lai de dong bo phien.
                  </div>
                </div>
              </div>
            </PageSection>
          </div>
        </div>
        {(hasProfileChanges || hasSettingsChanges) && (
          <div className="sticky bottom-4 z-20 mt-4 rounded-[24px] border border-sky-200 bg-white/90 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Ban dang co thay doi chua luu
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {hasProfileChanges ? "Ho so dang cho luu." : "Ho so da xong."}{" "}
                  {hasSettingsChanges
                    ? `${settingsChanges} cai dat dang cho dong bo.`
                    : "Khong co cai dat nao dang cho."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="rounded-2xl border-border bg-card text-foreground/80 hover:bg-card"
                  onClick={() => setSettings(originalSettings)}
                >
                  Hoan tac
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                  disabled={!hasProfileChanges || !!nameError || profileSaving}
                  onClick={saveProfile}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Luu ho so
                </Button>
                <Button
                  className="rounded-2xl bg-sky-500 text-white hover:bg-sky-400"
                  disabled={!hasSettingsChanges || settingsSaving}
                  onClick={saveSettings}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Luu cai dat
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;
