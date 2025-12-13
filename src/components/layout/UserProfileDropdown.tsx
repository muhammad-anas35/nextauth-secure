import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useAdmin } from "@/hooks/useAdmin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { LogOut, Mail, User, Check, X, Loader2, Pencil, Shield, Sparkles, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";

export function UserProfileDropdown() {
    const { user, signOut } = useAuth();
    const { profile, loading: profileLoading, updateProfile } = useProfile();
    const { isAdmin } = useAdmin();
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [saving, setSaving] = useState(false);
    const [open, setOpen] = useState(false);

    if (!user) return null;

    // Get name from profile (saved during signup) or fallback
    const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
    const initials = displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const handleEdit = () => {
        setEditName(profile?.full_name || "");
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditName("");
    };

    const handleSave = async () => {
        if (!editName.trim() || editName.trim().length < 2) return;

        setSaving(true);
        const { error } = await updateProfile({ full_name: editName.trim() });
        setSaving(false);

        if (!error) {
            toast.success("Name updated successfully!");
            setIsEditing(false);
        } else {
            toast.error("Failed to update name");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") handleCancel();
    };

    const handleSignOut = async () => {
        setOpen(false);
        await signOut();
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative h-11 w-11 rounded-full p-0 ring-2 ring-primary/30 hover:ring-primary/60 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-primary/25"
                >
                    <Avatar className="h-11 w-11 border-2 border-background">
                        <AvatarImage
                            src={profile?.avatar_url || undefined}
                            alt={displayName}
                            className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-violet-600 via-primary to-cyan-500 text-white font-bold text-sm">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    {/* Online indicator */}
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background animate-pulse" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[340px] p-0 overflow-hidden rounded-2xl bg-background/80 backdrop-blur-2xl border border-white/10 shadow-2xl"
                align="end"
                sideOffset={12}
            >
                {/* Premium Header with Gradient */}
                <div className="relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-primary/20 to-cyan-500/20" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.2),transparent_50%)]" />

                    {/* Animated sparkle effect */}
                    <Sparkles className="absolute top-3 right-3 h-4 w-4 text-yellow-400/60 animate-pulse" />

                    <div className="relative p-5">
                        <div className="flex items-center gap-4">
                            {/* Large Avatar */}
                            <div className="relative">
                                <Avatar className="h-16 w-16 ring-4 ring-white/20 shadow-xl">
                                    <AvatarImage
                                        src={profile?.avatar_url || undefined}
                                        alt={displayName}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-violet-600 via-primary to-cyan-500 text-white text-xl font-bold">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                {/* Verified badge */}
                                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                                    <Check className="h-3.5 w-3.5 text-white" />
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-lg text-foreground truncate">
                                        {profileLoading ? (
                                            <span className="h-6 w-28 bg-white/20 animate-pulse rounded-md inline-block" />
                                        ) : (
                                            displayName
                                        )}
                                    </h3>
                                </div>
                                <p className="text-sm text-muted-foreground/80 truncate mt-0.5">
                                    {user.email}
                                </p>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <Shield className="h-3.5 w-3.5 text-green-500" />
                                    <span className="text-xs text-green-500 font-medium">Verified Account</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider with glow */}
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                {/* Profile Details Section */}
                <div className="p-4 space-y-4">
                    {/* Email Field */}
                    <div className="group">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Mail className="h-3.5 w-3.5 text-blue-500" />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Email Address
                            </span>
                        </div>
                        <div className="ml-9 px-3 py-2.5 bg-muted/40 rounded-xl text-sm text-foreground/80 border border-transparent">
                            {user.email}
                        </div>
                    </div>

                    {/* Display Name Field (Editable) */}
                    <div className="group">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-7 w-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                <User className="h-3.5 w-3.5 text-violet-500" />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Display Name
                            </span>
                        </div>

                        {isEditing ? (
                            <div className="ml-9 flex items-center gap-2">
                                <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter your name"
                                    className="h-10 text-sm rounded-xl border-primary/50 focus:border-primary bg-background/50"
                                    autoFocus
                                    disabled={saving}
                                />
                                <Button
                                    size="icon"
                                    className="h-10 w-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25"
                                    onClick={handleSave}
                                    disabled={saving || !editName.trim() || editName.trim().length < 2}
                                >
                                    {saving ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Check className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-10 w-10 rounded-xl hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500"
                                    onClick={handleCancel}
                                    disabled={saving}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div
                                className="ml-9 px-3 py-2.5 bg-muted/40 hover:bg-muted/60 rounded-xl text-sm flex items-center justify-between cursor-pointer transition-all duration-200 border border-transparent hover:border-primary/30 group/name"
                                onClick={handleEdit}
                            >
                                <span className="text-foreground font-medium">
                                    {profile?.full_name || displayName}
                                </span>
                                <div className="flex items-center gap-1.5 text-muted-foreground opacity-0 group-hover/name:opacity-100 transition-opacity">
                                    <Pencil className="h-3.5 w-3.5" />
                                    <span className="text-xs">Edit</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                {/* Admin Dashboard Link (only for admins) */}
                {isAdmin && (
                    <>
                        <div className="px-3 pb-1">
                            <Link to="/admin/users" onClick={() => setOpen(false)}>
                                <Button
                                    variant="ghost"
                                    className="w-full h-11 justify-start rounded-xl text-violet-600 hover:text-violet-700 hover:bg-violet-500/10 transition-all duration-200 group"
                                >
                                    <LayoutDashboard className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                                    <span className="font-medium">Admin Dashboard</span>
                                </Button>
                            </Link>
                        </div>
                        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                    </>
                )}

                {/* Sign Out Button */}
                <div className="p-3">
                    <Button
                        variant="ghost"
                        className="w-full h-11 justify-start rounded-xl text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-all duration-200 group"
                        onClick={handleSignOut}
                    >
                        <LogOut className="h-4 w-4 mr-3 group-hover:translate-x-0.5 transition-transform" />
                        <span className="font-medium">Sign Out</span>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
