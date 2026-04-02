import { useEffect, useState, useCallback } from "react";
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
import WinterNightBackground from "@/components/WinterNightBackground";
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
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserManagement | null>(null);
  const [actionType, setActionType] = useState<"promote" | "demote" | "disable" | "enable" | null>(null);

  const fetchUsers = useCallback(async (pageNum = 0) => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers(pageNum, 20) as PagedResponse;
      setUsers(data.content);
      setTotalPages(data.totalPages);
      setPage(data.number);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchUsers();
      return;
    }

    try {
      setLoading(true);
      const data = await adminApi.searchUsers(searchQuery) as UserManagement[];
      setUsers(data);
      setTotalPages(1);
      setPage(0);
    } catch (error) {
      console.error("Failed to search users:", error);
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedUser || !actionType) return;

    try {
      switch (actionType) {
        case "promote":
          await adminApi.promoteToAdmin(selectedUser.id);
          toast({ title: "Success", description: "User promoted to admin" });
          break;
        case "demote":
          await adminApi.demoteFromAdmin(selectedUser.id);
          toast({ title: "Success", description: "Admin demoted to user" });
          break;
        case "disable":
          await adminApi.updateUserStatus(selectedUser.id, false);
          toast({ title: "Success", description: "User disabled" });
          break;
        case "enable":
          await adminApi.updateUserStatus(selectedUser.id, true);
          toast({ title: "Success", description: "User enabled" });
          break;
      }
      fetchUsers(page);
    } catch (error) {
      console.error("Action failed:", error);
      toast({
        title: "Error",
        description: "Action failed",
        variant: "destructive",
      });
    } finally {
      setSelectedUser(null);
      setActionType(null);
    }
  };

  const confirmAction = (user: UserManagement, action: typeof actionType) => {
    setSelectedUser(user);
    setActionType(action);
  };

  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen relative pb-20">
      <WinterNightBackground snowCount={40} sparkleCount={20} intensity="light" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
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
              User Management
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
                    placeholder="Search by email or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 bg-background/50"
                  />
                </div>
                <Button onClick={handleSearch}>Search</Button>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      fetchUsers();
                    }}
                  >
                    Clear
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
                <CardTitle>Users ({users.length})</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
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
                            <Badge variant="default" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                          {!user.enabled && (
                            <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
                              Disabled
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
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
                                Demote
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => confirmAction(user, "promote")}
                              >
                                <Shield className="w-4 h-4 mr-1" />
                                Promote
                              </Button>
                            )}

                            {user.enabled ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => confirmAction(user, "disable")}
                              >
                                <UserX className="w-4 h-4 mr-1" />
                                Disable
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => confirmAction(user, "enable")}
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Enable
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
                      onClick={() => fetchUsers(page - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page + 1} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => fetchUsers(page + 1)}
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
      <AlertDialog open={!!selectedUser && !!actionType} onOpenChange={() => {
        setSelectedUser(null);
        setActionType(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "promote" && `Promote ${selectedUser?.displayName} to admin?`}
              {actionType === "demote" && `Demote ${selectedUser?.displayName} from admin?`}
              {actionType === "disable" && `Disable ${selectedUser?.displayName}'s account?`}
              {actionType === "enable" && `Enable ${selectedUser?.displayName}'s account?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
