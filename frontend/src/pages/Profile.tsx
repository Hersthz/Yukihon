import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Award, BookOpen, Calendar, Flame, GraduationCap, LogOut, Shield, Trophy, User } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const achievements = [
  { icon: Flame, title: "7-Day Streak", description: "Học đều 7 ngày liên tiếp", unlocked: true },
  { icon: Trophy, title: "Quiz Master", description: "Hoàn thành 50 quiz", unlocked: true },
  { icon: BookOpen, title: "Vocabulary Wizard", description: "Học 500 từ mới", unlocked: false },
  { icon: Calendar, title: "Consistency", description: "Hoàn thành mục tiêu 30 ngày", unlocked: false },
];

const Profile = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("yukihon_token");
    localStorage.removeItem("yukihon_user");
    navigate("/auth");
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1380px]">
        <PageHeader
          action={
            <Button className="rounded-2xl bg-sky-500 text-white hover:bg-sky-400" onClick={handleSave}>
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          }
          eyebrow="Profile"
          icon={<User className="h-6 w-6 text-sky-600" />}
          title="Hồ sơ"
          description="Tổ chức lại thành các panel nhỏ và rõ để hồ sơ không còn cao và bí như một form dài."
        />

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <MetricCard hint="Chuỗi học hiện tại" icon={<Flame className="h-4 w-4 text-amber-500" />} label="Streak" value="12 ngày" />
          <MetricCard hint="Mục tiêu chính đang theo" icon={<GraduationCap className="h-4 w-4 text-sky-500" />} label="JLPT" value="N4" />
          <MetricCard hint="Thành tựu đã mở" icon={<Award className="h-4 w-4 text-violet-500" />} label="Achievement" value="2/4" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="space-y-4">
            <PageSection title="Thông tin nhanh" description="Một cột tóm tắt để giảm tải cho phần form chi tiết.">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 bg-[linear-gradient(135deg,#93c5fd,#86efac)]">
                  <AvatarFallback className="bg-transparent text-xl font-semibold text-foreground">AC</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold text-foreground">Alex Chen</p>
                  <p className="text-sm text-muted-foreground">alex@example.com</p>
                  <Badge className="mt-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">Calm mode</Badge>
                </div>
              </div>

              <div className="mt-4 rounded-[20px] border border-violet-200 bg-violet-50/70 p-4">
                <p className="text-sm font-semibold text-violet-800">Mục tiêu tuần này</p>
                <p className="mt-1 text-sm leading-6 text-foreground/80">Giữ 5 phiên học ngắn, ôn 1 chủ đề JLPT và không mở quá nhiều module cùng lúc.</p>
              </div>

              <Button className="mt-4 w-full rounded-2xl border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100" onClick={handleLogout} variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </Button>
            </PageSection>
          </div>

          <div className="space-y-4">
            <PageSection title="Thông tin cá nhân" description="Form được rút gọn, chia khoảng thở đều để đọc nhanh và sửa nhanh.">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ tên</Label>
                  <Input className="h-11 rounded-2xl border-border bg-card" defaultValue="Alex Chen" id="name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input className="h-11 rounded-2xl border-border bg-muted" defaultValue="alex@example.com" disabled id="email" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Giới thiệu</Label>
                  <Input className="h-11 rounded-2xl border-border bg-card" defaultValue="Learning Japanese for travel and work" id="bio" />
                </div>
              </div>
            </PageSection>

            <PageSection title="Tùy chọn học tập" description="Chuyển từ layout tab sang 1 khối compact, bớt chuyển ngữ cảnh liên tục.">
              <div className="space-y-4">
                {[
                  { title: "Hiện romaji", description: "Hiển thị phát âm Latin khi cần." },
                  { title: "Hiện furigana", description: "Bật gợi ý đọc cho kanji khó." },
                  { title: "Tự động phát âm", description: "Nghe lại âm thanh khi mở thẻ học." },
                ].map((item, index) => (
                  <div key={item.title} className="flex items-center justify-between rounded-[18px] border border-border bg-card p-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked={index < 2} />
                  </div>
                ))}
              </div>
            </PageSection>

            <PageSection title="Thành tựu" description="Trình bày thành lưới thấp và nhẹ để overview thành tích rõ hơn.">
              <div className="grid gap-3 md:grid-cols-2">
                {achievements.map((item) => (
                  <div
                    key={item.title}
                    className={`rounded-[20px] border p-4 ${
                      item.unlocked ? "border-amber-200 bg-amber-50/70" : "border-border bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`rounded-2xl p-2 ${item.unlocked ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                        {item.unlocked && <Badge className="mt-2 rounded-full border border-amber-200 bg-white text-amber-700">Unlocked</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </PageSection>

            <PageSection title="Bảo mật" description="Tách thành một panel riêng để không lẫn với các phần nhẹ hơn.">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                  <Input className="h-11 rounded-2xl border-border bg-card" id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Mật khẩu mới</Label>
                  <Input className="h-11 rounded-2xl border-border bg-card" id="new-password" type="password" />
                </div>
              </div>
              <Button className="mt-4 rounded-2xl border-border bg-white text-foreground/80" variant="outline">
                <Shield className="mr-2 h-4 w-4" />
                Cập nhật mật khẩu
              </Button>
            </PageSection>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
