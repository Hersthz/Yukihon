import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Shield,
  ShieldOff,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminApi } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface UserManagement {
  id: number;
  email: string;
  displayName: string;
  enabled: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

interface PagedResponse {
  content: UserManagement[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const AdminUsers = () => {
  const { isAdmin, user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserManagement | null>(null);
  const [actionType, setActionType] = useState<"promote" | "demote" | "disable" | "enable" | null>(
    null
  );

  const usersQuery = useQuery({
    queryKey: ["admin-users", appliedSearch, page],
    queryFn: async (): Promise<PagedResponse> => {
      if (appliedSearch) {
        const found = (await adminApi.searchUsers(appliedSearch)) as UserManagement[];
        return {
          content: found,
          totalElements: found.length,
          totalPages: 1,
          number: 0,
          size: found.length,
        };
      }
      return (await adminApi.getUsers(page, 20)) as PagedResponse;
    },
  });

  const users = usersQuery.data?.content ?? [];
  const totalPages = usersQuery.data?.totalPages ?? 0;
  const loading = usersQuery.isLoading;

  useEffect(() => {
    if (usersQuery.error) {
      toast({
        title: "Lỗi",
        description: "Không tải được danh sách người dùng",
        variant: "destructive",
      });
    }
  }, [usersQuery.error, toast]);

  const actionMutation = useMutation({
    mutationFn: ({
      user,
      action,
    }: {
      user: UserManagement;
      action: NonNullable<typeof actionType>;
    }) => {
      switch (action) {
        case "promote":
          return adminApi.promoteToAdmin(user.id);
        case "demote":
          return adminApi.demoteFromAdmin(user.id);
        case "disable":
          return adminApi.updateUserStatus(user.id, false);
        case "enable":
          return adminApi.updateUserStatus(user.id, true);
      }
    },
    onSuccess: (_data, { action }) => {
      const messages = {
        promote: "Đã thăng người dùng lên quản trị viên",
        demote: "Đã hạ quản trị viên xuống người dùng",
        disable: "Đã vô hiệu hóa người dùng",
        enable: "Đã kích hoạt người dùng",
      };
      toast({ title: "Thành công", description: messages[action] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => {
      toast({ title: "Lỗi", description: "Thao tác thất bại", variant: "destructive" });
    },
    onSettled: () => {
      setSelectedUser(null);
      setActionType(null);
    },
  });

  const handleSearch = () => {
    setPage(0);
    setAppliedSearch(searchQuery.trim());
  };

  const handleAction = () => {
    if (!selectedUser || !actionType) return;
    actionMutation.mutate({ user: selectedUser, action: actionType });
  };

  const confirmAction = (user: UserManagement, action: typeof actionType) => {
    setSelectedUser(user);
    setActionType(action);
  };

  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1520px] py-2">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Quản lý người dùng
            </h1>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo email hoặc tên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 bg-background/50"
                  />
                </div>
                <Button onClick={handleSearch}>Tìm kiếm</Button>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setAppliedSearch("");
                      setPage(0);
                    }}
                  >
                    Xóa
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Users List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader>
                <CardTitle>Người dùng ({users.length})</CardTitle>
                <CardDescription>Quản lý tài khoản và quyền của người dùng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50 hover:bg-background/70 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{user.displayName}</span>
                          {user.roles.includes("ADMIN") && (
                            <Badge
                              variant="default"
                              className="bg-purple-500/20 text-purple-400 border-purple-500/30"
                            >
                              <Shield className="w-3 h-3 mr-1" />
                              Quản trị
                            </Badge>
                          )}
                          {!user.enabled && (
                            <Badge
                              variant="destructive"
                              className="bg-red-500/20 text-red-400 border-red-500/30"
                            >
                              Đã vô hiệu hóa
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Tham gia: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {currentUser?.id !== user.id && (
                          <>
                            {user.roles.includes("ADMIN") ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => confirmAction(user, "demote")}
                              >
                                <ShieldOff className="w-4 h-4 mr-1" />
                                Hạ quyền
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => confirmAction(user, "promote")}
                              >
                                <Shield className="w-4 h-4 mr-1" />
                                Thăng quyền
                              </Button>
                            )}

                            {user.enabled ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => confirmAction(user, "disable")}
                              >
                                <UserX className="w-4 h-4 mr-1" />
                                Vô hiệu hóa
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => confirmAction(user, "enable")}
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Kích hoạt
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Trang {page + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!selectedUser && !!actionType}
        onOpenChange={() => {
          setSelectedUser(null);
          setActionType(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận thao tác</AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "promote" && `Thăng ${selectedUser?.displayName} lên quản trị viên?`}
              {actionType === "demote" &&
                `Hạ ${selectedUser?.displayName} khỏi quyền quản trị viên?`}
              {actionType === "disable" &&
                `Vô hiệu hóa tài khoản của ${selectedUser?.displayName}?`}
              {actionType === "enable" && `Kích hoạt tài khoản của ${selectedUser?.displayName}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminUsers;
