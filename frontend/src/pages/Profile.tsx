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
    label: score >= 80 ? "Mạnh" : score >= 50 ? "Khá ổn" : value ? "Còn yếu" : "Chưa nhập",
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
        title: "Không tải được cài đặt",
        description: "Trang vẫn mở được, nhưng một số dữ liệu có thể chưa mới nhất.",
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
    ? "Tên hiển thị không được để trống."
    : name.length < 2
      ? "Tên hiển thị nên từ 2 ký tự trở lên."
      : name.length > 50
        ? "Tên hiển thị nên dưới 50 ký tự."
        : null;
  const hasProfileChanges = name !== (user?.displayName ?? "").trim();
  const settingsChanges = diffCount(settings, originalSettings);
  const hasSettingsChanges = settingsChanges > 0;
  const pwd = strength(passwordForm.newPassword);
  const passwordError =
    !passwordForm.currentPassword && !passwordForm.newPassword && !passwordForm.confirmPassword
      ? null
      : !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword
        ? "Cần điền đầy đủ 3 trường mật khẩu."
        : passwordForm.newPassword.length < 8
          ? "Mật khẩu mới cần ít nhất 8 ký tự."
          : passwordForm.newPassword === passwordForm.currentPassword
            ? "Mật khẩu mới cần khác mật khẩu hiện tại."
            : passwordForm.newPassword !== passwordForm.confirmPassword
              ? "Xác nhận mật khẩu chưa khớp."
              : null;
  const deadlineText = useMemo(() => {
    if (!settings.jlptDeadlineDate) return "Chưa đặt deadline.";
    const today = new Date();
    const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const deadline = new Date(`${settings.jlptDeadlineDate}T00:00:00`);
    const diff = Math.round((deadline.getTime() - base.getTime()) / 86400000);
    if (Number.isNaN(diff)) return "Deadline chưa hợp lệ.";
    if (diff < 0) return "Deadline đã qua.";
    if (diff === 0) return "Hôm nay là deadline.";
    return `Còn ${diff} ngày đến hạn.`;
  }, [settings.jlptDeadlineDate]);

  const saveProfile = async () => {
    if (nameError || !hasProfileChanges) {
      if (nameError)
        toast({ title: "Thông tin chưa hợp lệ", description: nameError, variant: "destructive" });
      return;
    }
    setProfileSaving(true);
    try {
      await authApi.updateProfile({ displayName: name });
      await refreshUser();
      toast({ title: "Đã cập nhật hồ sơ", description: "Tên hiển thị đã được lưu." });
    } catch (error) {
      toast({
        title: "Không thể cập nhật hồ sơ",
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
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
        title: "Đã lưu cài đặt",
        description: "Trải nghiệm học tập của bạn đã được cập nhật.",
      });
    } catch (error) {
      toast({
        title: "Không thể lưu cài đặt",
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setSettingsSaving(false);
    }
  };

  const savePassword = async () => {
    if (passwordError) {
      toast({
        title: "Không thể đổi mật khẩu",
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
      toast({ title: "Đổi mật khẩu thành công", description: "Mật khẩu mới đã có hiệu lực ngay." });
    } catch (error) {
      toast({
        title: "Không thể đổi mật khẩu",
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
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
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      </DashboardLayout>
    );

  const dirty = hasProfileChanges || hasSettingsChanges;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1420px]">
        <PageHeader
          eyebrow="Tài khoản"
          icon={<Settings2 className="h-6 w-6 text-primary" />}
          title="Tài khoản và cài đặt"
          description="Một nơi duy nhất để quản lý hồ sơ, bảo mật và những tùy chỉnh giúp việc tự học mượt hơn."
          action={
            <Badge
              className={cn(
                "rounded-full border px-3 py-1.5",
                dirty
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              )}
            >
              {dirty ? "Đang có thay đổi chưa lưu" : "Tất cả đã được lưu"}
            </Badge>
          }
        />
        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Trạng thái"
            value={dirty ? "Cần lưu" : "Đã đồng bộ"}
            hint={dirty ? "Có thay đổi đang chờ xử lý." : "Không có thay đổi nào đang chờ."}
            icon={
              <CheckCircle2
                className={cn("h-4 w-4", dirty ? "text-amber-500" : "text-emerald-500")}
              />
            }
          />
          <MetricCard
            label="JLPT"
            value={settings.targetJlptLevel}
            hint={deadlineText}
            icon={<GraduationCap className="h-4 w-4 text-primary" />}
          />
          <MetricCard
            label="Mục tiêu mỗi ngày"
            value={`${settings.dailyGoalMinutes} phút`}
            hint={`Quiz ${settings.quizDifficulty} • ${settings.showFurigana ? "Có furigana" : "Không furigana"}`}
            icon={<Target className="h-4 w-4 text-emerald-500" />}
          />
          <MetricCard
            label="Thông báo"
            value={
              settings.emailNotifications || settings.pushNotifications ? "Đang bật" : "Đang tắt"
            }
            hint={
              settings.emailNotifications && settings.pushNotifications
                ? "Email và push"
                : settings.emailNotifications
                  ? "Chỉ email"
                  : settings.pushNotifications
                    ? "Chỉ push"
                    : "Tắt hết"
            }
            icon={<Bell className="h-4 w-4 text-violet-500" />}
          />
        </div>
        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <PageSection
            title="Tổng quan"
            description="Nhìn nhanh tình trạng tài khoản và trải nghiệm hiện tại."
            className="xl:sticky xl:top-[92px] xl:self-start"
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback
                  className="text-xl font-semibold text-primary-foreground"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.6))",
                  }}
                >
                  {(user?.displayName?.[0] || user?.email?.[0] || "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-foreground">
                  {user?.displayName || "Người học"}
                </p>
                <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(user?.roles || ["USER"]).map((role) => (
                    <Badge
                      key={role}
                      className="rounded-full border border-primary/20 bg-primary/10 text-primary"
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
                Giao diện <span className="font-medium text-foreground">sáng</span> • đang hiển thị{" "}
                <span className="font-medium capitalize text-foreground">{resolvedTheme}</span>
              </div>
              <div className="rounded-2xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
                Ngôn ngữ <span className="font-medium text-foreground">{settings.language}</span> •
                mục tiêu{" "}
                <span className="font-medium text-foreground">{settings.targetJlptLevel}</span>
              </div>
              <div className="rounded-2xl border border-primary/20 bg-primary/[0.06] p-4 text-sm leading-6 text-foreground/80">
                Bạn đang hướng tới {settings.targetJlptLevel} với mục tiêu{" "}
                {settings.dailyGoalMinutes} phút mỗi ngày và quiz {settings.quizDifficulty}.
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
              Đăng xuất
            </Button>
          </PageSection>
          <div className="space-y-4">
            <PageSection
              title="Hồ sơ cá nhân"
              description="Cập nhật tên hiển thị và giữ thông tin tài khoản gọn gàng."
              action={
                <Button
                  className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!hasProfileChanges || !!nameError || profileSaving}
                  onClick={saveProfile}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {profileSaving ? "Đang lưu..." : "Lưu hồ sơ"}
                </Button>
              }
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Tên hiển thị</Label>
                  <Input
                    id="displayName"
                    className={cn(
                      "h-11 rounded-2xl border-border bg-card",
                      nameError ? "border-rose-300" : ""
                    )}
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Nhập tên hiển thị của bạn"
                  />
                  <p
                    className={cn("text-xs", nameError ? "text-rose-600" : "text-muted-foreground")}
                  >
                    {nameError || "Tên này sẽ hiện ở trang tổng quan và các khu vực học tập."}
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
                    Email hiện chưa đổi trong màn này để tránh tác động đến đăng nhập.
                  </p>
                </div>
              </div>
            </PageSection>
            <PageSection
              title="Học tập và trải nghiệm"
              description="Tất cả tùy chỉnh học tập, thông báo và giao diện ở cùng một chỗ."
            >
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Mục tiêu hằng ngày
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Điều chỉnh nhịp học theo mục tiêu cá nhân.
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        {settings.dailyGoalMinutes} phút
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
                    <div className="rounded-2xl border border-border bg-card p-4">
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
                    <div className="rounded-2xl border border-border bg-card p-4">
                      <Label className="mb-2 block text-sm font-semibold text-foreground">
                        Giao diện
                      </Label>
                      <Select value="light" onValueChange={() => setField("theme", "light")}>
                        <SelectTrigger className="h-11 rounded-2xl border-border bg-card">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Chỉ nền sáng</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                      <Label className="mb-2 block text-sm font-semibold text-foreground">
                        Ngôn ngữ
                      </Label>
                      <Select
                        value={settings.language}
                        onValueChange={(value) => setField("language", value)}
                      >
                        <SelectTrigger className="h-11 rounded-2xl border-border bg-card">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vi">Tiếng Việt</SelectItem>
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
                      t: "Thông báo qua email",
                      d: "Nhận tổng kết và nhắc học qua email.",
                      i: Bell,
                    },
                    {
                      k: "pushNotifications",
                      t: "Thông báo đẩy",
                      d: "Nhắc nhanh trên thiết bị.",
                      i: Volume2,
                    },
                    {
                      k: "showFurigana",
                      t: "Hiện furigana",
                      d: "Bật gợi ý đọc trên kanji.",
                      i: UserRound,
                    },
                    {
                      k: "showRomaji",
                      t: "Hiện romaji",
                      d: "Thêm phiên âm Latin khi cần.",
                      i: UserRound,
                    },
                    {
                      k: "autoPlayAudio",
                      t: "Tự phát audio",
                      d: "Phát âm thanh khi mở thẻ từ vựng.",
                      i: Palette,
                    },
                  ].map((item) => {
                    const Icon = item.i;
                    return (
                      <div
                        key={item.k}
                        className="flex items-center justify-between rounded-2xl border border-border bg-card p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
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
              title="Bảo mật"
              description="Đổi mật khẩu ngay tại đây với hướng dẫn rõ ràng."
              action={
                <Button
                  className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!!passwordError || passwordSaving}
                  onClick={savePassword}
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  {passwordSaving ? "Đang cập nhật..." : "Đổi mật khẩu"}
                </Button>
              }
            >
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
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
                      <Label htmlFor="newPassword">Mật khẩu mới</Label>
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
                      <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
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
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">Độ mạnh mật khẩu</p>
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
                        "Ưu tiên mật khẩu đủ dài, có chữ hoa, số và ký tự đặc biệt."}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                      <p className="text-sm font-semibold text-emerald-800">Tình trạng bảo mật</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-foreground/80">
                      {passwordError
                        ? "Form đổi mật khẩu cần chỉnh lại trước khi lưu."
                        : "Mọi thứ đã sẵn sàng, bạn có thể đổi mật khẩu bất cứ lúc nào."}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">
                    Mật khẩu mới có hiệu lực ngay. Nếu bạn đang học trên nhiều thiết bị, có thể cần
                    đăng nhập lại để đồng bộ phiên.
                  </div>
                </div>
              </div>
            </PageSection>
          </div>
        </div>
        {dirty && (
          <div className="sticky bottom-4 z-20 mt-4 rounded-3xl border border-primary/20 bg-white/90 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Bạn đang có thay đổi chưa lưu
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {hasProfileChanges ? "Hồ sơ đang chờ lưu." : "Hồ sơ đã xong."}{" "}
                  {hasSettingsChanges
                    ? `${settingsChanges} cài đặt đang chờ đồng bộ.`
                    : "Không có cài đặt nào đang chờ."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="rounded-2xl border-border bg-card text-foreground/80 hover:bg-card"
                  onClick={() => setSettings(originalSettings)}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Hoàn tác
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl border-primary/20 bg-primary/10 text-primary hover:bg-primary/15"
                  disabled={!hasProfileChanges || !!nameError || profileSaving}
                  onClick={saveProfile}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Lưu hồ sơ
                </Button>
                <Button
                  className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!hasSettingsChanges || settingsSaving}
                  onClick={saveSettings}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Lưu cài đặt
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
