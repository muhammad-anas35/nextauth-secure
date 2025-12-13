import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { Navbar } from "@/components/layout/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Users,
    Search,
    Shield,
    ShieldCheck,
    Mail,
    Calendar,
    Loader2,
    RefreshCw,
    LayoutDashboard,
    Trash2,
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminUsers() {
    const navigate = useNavigate();
    const { isAdmin, users, usersLoading, fetchUsers, updateUserAdmin, deleteUser } = useAdmin();
    const [searchTerm, setSearchTerm] = useState("");
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin, fetchUsers]);

    const filteredUsers = users.filter(
        (user) =>
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
        setUpdatingUserId(userId);
        const { error } = await updateUserAdmin(userId, !currentStatus);
        setUpdatingUserId(null);

        if (error) {
            toast.error("Failed to update admin status");
        } else {
            toast.success(`User ${!currentStatus ? "promoted to" : "removed from"} admin`);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        setUpdatingUserId(userId);
        const { error } = await deleteUser(userId);
        setUpdatingUserId(null);

        if (error) {
            toast.error("Failed to delete user: " + error.message);
        } else {
            toast.success("User permanently deleted");
        }
    };

    const getInitials = (name: string | null, email: string | null) => {
        if (name) {
            return name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }
        return email?.[0]?.toUpperCase() || "U";
    };

    const stats = {
        total: users.length,
        admins: users.filter((u) => u.is_admin).length,
        regular: users.filter((u) => !u.is_admin).length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            <Navbar />

            <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-600 to-primary flex items-center justify-center shadow-lg shadow-primary/25">
                                <LayoutDashboard className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
                                <p className="text-muted-foreground">Manage users and permissions</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Users</p>
                                    <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                                    <ShieldCheck className="h-6 w-6 text-violet-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Administrators</p>
                                    <p className="text-3xl font-bold text-foreground">{stats.admins}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Regular Users</p>
                                    <p className="text-3xl font-bold text-foreground">{stats.regular}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Users Table Card */}
                    <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl overflow-hidden">
                        {/* Table Header */}
                        <div className="p-6 border-b border-border/50">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-primary" />
                                    <h2 className="text-xl font-semibold text-foreground">All Users</h2>
                                    <Badge variant="secondary" className="ml-2">
                                        {filteredUsers.length}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 w-64 bg-muted/50 border-border/50"
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => fetchUsers()}
                                        disabled={usersLoading}
                                        className="shrink-0"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${usersLoading ? "animate-spin" : ""}`} />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Table Content */}
                        {usersLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-border/50">
                                            <TableHead className="w-[300px]">User</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Joined</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead className="text-right">Admin Access</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-12">
                                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                        <Users className="h-10 w-10 opacity-50" />
                                                        <p>No users found</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <TableRow
                                                    key={user.id}
                                                    className="border-border/50 hover:bg-muted/30 transition-colors"
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10 border-2 border-background shadow">
                                                                <AvatarImage src={user.avatar_url || undefined} />
                                                                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-primary text-white text-sm font-semibold">
                                                                    {getInitials(user.full_name, user.email)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium text-foreground">
                                                                    {user.full_name || "No name"}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    ID: {user.id.slice(0, 8)}...
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">{user.email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">
                                                                {format(new Date(user.created_at), "MMM d, yyyy")}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.is_admin ? (
                                                            <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/20 hover:bg-violet-500/20">
                                                                <ShieldCheck className="h-3 w-3 mr-1" />
                                                                Admin
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="opacity-70">
                                                                <Shield className="h-3 w-3 mr-1" />
                                                                User
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {updatingUserId === user.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Switch
                                                                    checked={user.is_admin}
                                                                    onCheckedChange={() =>
                                                                        handleToggleAdmin(user.id, user.is_admin)
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="w-[50px]">
                                                        <div className="flex justify-end pr-2">
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                                                        disabled={updatingUserId === user.id}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete User Account?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This action cannot be undone. This will permanently delete the account
                                                                            for <strong>{user.email}</strong> and remove all their data.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            className="bg-red-500 hover:bg-red-600"
                                                                            onClick={() => handleDeleteUser(user.id)}
                                                                        >
                                                                            Delete User
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
