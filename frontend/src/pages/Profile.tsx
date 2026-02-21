import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Flame, BookOpen, Settings, LogOut, User, GraduationCap, Shield, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20">
              <Settings className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Profile & Settings</h1>
              <p className="text-sm text-slate-400">Manage your account and learning preferences</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
              <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-white/[0.08] data-[state=active]:text-white">
                <User className="w-4 h-4 mr-2" />Profile
              </TabsTrigger>
              <TabsTrigger value="learning" className="rounded-lg data-[state=active]:bg-white/[0.08] data-[state=active]:text-white">
                <GraduationCap className="w-4 h-4 mr-2" />Learning
              </TabsTrigger>
              <TabsTrigger value="account" className="rounded-lg data-[state=active]:bg-white/[0.08] data-[state=active]:text-white">
                <Shield className="w-4 h-4 mr-2" />Account
              </TabsTrigger>
              <TabsTrigger value="achievements" className="rounded-lg data-[state=active]:bg-white/[0.08] data-[state=active]:text-white">
                <Award className="w-4 h-4 mr-2" />Achievements
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
                <div className="h-0.5 bg-gradient-to-r from-cyan-500/40 to-blue-500/40" />
                <div className="p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20 bg-gradient-to-br from-cyan-500 to-blue-500 ring-2 ring-white/10 ring-offset-2 ring-offset-slate-950">
                        <AvatarFallback className="text-xl font-bold text-white">AC</AvatarFallback>
                      </Avatar>
                      <div>
                        <Button variant="outline" size="sm" className="border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06] text-white">
                          Change photo
                        </Button>
                        <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm text-slate-300">Full name</Label>
                        <Input id="name" defaultValue="Alex Chen" className="bg-white/[0.03] border-white/[0.06] text-white focus:border-cyan-500/40" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm text-slate-300">Email</Label>
                        <Input id="email" type="email" defaultValue="alex@example.com" className="bg-white/[0.03] border-white/[0.06] text-white opacity-60" disabled />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-sm text-slate-300">Bio</Label>
                      <Input id="bio" placeholder="Tell us about yourself..." defaultValue="Learning Japanese for travel and work" className="bg-white/[0.03] border-white/[0.06] text-white focus:border-cyan-500/40" />
                    </div>

                    <Button onClick={handleSave} disabled={isSaving} className="bg-white/[0.06] hover:bg-cyan-500/15 text-white border border-white/[0.08] hover:border-cyan-500/30 transition-all">
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Learning Tab */}
            <TabsContent value="learning" className="space-y-6">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
                <div className="h-0.5 bg-gradient-to-r from-purple-500/40 to-pink-500/40" />
                <div className="p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Learning Preferences</h3>
                  <div className="space-y-5">
                    {[
                      { label: "Daily goal", description: "Minutes of study per day", value: "15", options: ["5", "10", "15", "30", "60"] },
                      { label: "Reminder time", description: "Daily practice reminder", value: "19:00", options: ["08:00", "12:00", "17:00", "19:00", "21:00"] },
                    ].map((setting, idx) => (
                      <div key={idx} className="flex items-center justify-between pb-5 border-b border-white/[0.04] last:border-0">
                        <div>
                          <Label className="text-white text-sm">{setting.label}</Label>
                          <p className="text-xs text-slate-500 mt-0.5">{setting.description}</p>
                        </div>
                        <Select defaultValue={setting.value}>
                          <SelectTrigger className="w-28 bg-white/[0.03] border-white/[0.06] text-white text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {setting.options.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}

                    {[
                      { label: "Show romaji", description: "Display pronunciation" },
                      { label: "Show furigana", description: "Display reading hints above kanji" },
                      { label: "Auto-play audio", description: "Automatically play pronunciation" },
                      { label: "Dark mode", description: "Use dark theme" },
                    ].map((toggle, idx) => (
                      <div key={idx} className="flex items-center justify-between pb-5 border-b border-white/[0.04] last:border-0">
                        <div>
                          <Label className="text-white text-sm">{toggle.label}</Label>
                          <p className="text-xs text-slate-500 mt-0.5">{toggle.description}</p>
                        </div>
                        <Switch defaultChecked={idx < 3} />
                      </div>
                    ))}

                    <Button onClick={handleSave} className="w-full bg-white/[0.06] hover:bg-purple-500/15 text-white border border-white/[0.08] hover:border-purple-500/30 transition-all">
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
                <div className="h-0.5 bg-gradient-to-r from-amber-500/40 to-orange-500/40" />
                <div className="p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Account Security</h3>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Change Password</h4>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="current-pw" className="text-sm text-slate-400">Current password</Label>
                          <Input id="current-pw" type="password" className="bg-white/[0.03] border-white/[0.06]" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-pw" className="text-sm text-slate-400">New password</Label>
                          <Input id="new-pw" type="password" className="bg-white/[0.03] border-white/[0.06]" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-pw" className="text-sm text-slate-400">Confirm password</Label>
                          <Input id="confirm-pw" type="password" className="bg-white/[0.03] border-white/[0.06]" />
                        </div>
                        <Button className="bg-white/[0.06] hover:bg-amber-500/15 text-white border border-white/[0.08] hover:border-amber-500/30 transition-all">
                          Update Password
                        </Button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/[0.04]">
                      <h4 className="text-sm font-semibold text-red-400/80 uppercase tracking-wider mb-4">Danger Zone</h4>
                      <Button onClick={handleLogout} variant="ghost" className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
                <div className="h-0.5 bg-gradient-to-r from-amber-500/40 to-yellow-500/40" />
                <div className="p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Your Achievements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { icon: Flame, title: "7-Day Streak", description: "Study for 7 consecutive days", unlocked: true },
                      { icon: Trophy, title: "Quiz Master", description: "Complete 50 quizzes", unlocked: true },
                      { icon: BookOpen, title: "Vocabulary Wizard", description: "Learn 500 words", unlocked: false },
                      { icon: Calendar, title: "Consistent Performer", description: "Complete daily goal for 30 days", unlocked: false },
                    ].map((achievement, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className={`p-5 rounded-xl border transition-all ${
                          achievement.unlocked
                            ? "bg-amber-500/[0.06] border-amber-500/15 hover:border-amber-500/25"
                            : "bg-white/[0.02] border-white/[0.04] opacity-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-lg ${achievement.unlocked ? "bg-amber-500/15" : "bg-white/[0.04]"}`}>
                            <achievement.icon className={`w-5 h-5 ${achievement.unlocked ? "text-amber-400" : "text-slate-500"}`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-sm">{achievement.title}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{achievement.description}</p>
                            {achievement.unlocked && (
                              <Badge className="mt-2 bg-amber-500/15 text-amber-400 border border-amber-500/20 text-xs">Unlocked</Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
