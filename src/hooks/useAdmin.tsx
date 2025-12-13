import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface UseAdminReturn {
    isAdmin: boolean;
    loading: boolean;
    users: Profile[];
    usersLoading: boolean;
    fetchUsers: () => Promise<void>;
    updateUserAdmin: (userId: string, isAdmin: boolean) => Promise<{ error: Error | null }>;
    deleteUser: (userId: string) => Promise<{ error: Error | null }>;
}

export function useAdmin(): UseAdminReturn {
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<Profile[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);

    // Check if current user is admin
    useEffect(() => {
        async function checkAdminStatus() {
            if (!user) {
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("is_admin")
                    .eq("id", user.id)
                    .single();

                if (error) throw error;
                setIsAdmin(data?.is_admin || false);
            } catch (error) {
                console.error("Error checking admin status:", error);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        }

        checkAdminStatus();
    }, [user]);

    // Fetch all users (only works for admins due to RLS)
    const fetchUsers = useCallback(async () => {
        if (!isAdmin) return;

        setUsersLoading(true);
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setUsersLoading(false);
        }
    }, [isAdmin]);

    // Update user admin status
    const updateUserAdmin = async (userId: string, newAdminStatus: boolean) => {
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ is_admin: newAdminStatus })
                .eq("id", userId);

            if (error) throw error;

            // Update local state
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === userId ? { ...u, is_admin: newAdminStatus } : u
                )
            );

            return { error: null };
        } catch (error) {
            console.error("Error updating user admin status:", error);
            return { error: error as Error };
        }
    };

    // Delete user (calls RPC function)
    const deleteUser = async (userId: string) => {
        try {
            const { error } = await supabase.rpc("delete_user_by_admin", {
                user_id: userId,
            });

            if (error) throw error;

            // Remove from local state
            setUsers((prev) => prev.filter((u) => u.id !== userId));

            return { error: null };
        } catch (error) {
            console.error("Error deleting user:", error);
            return { error: error as Error };
        }
    };

    return {
        isAdmin,
        loading,
        users,
        usersLoading,
        fetchUsers,
        updateUserAdmin,
        deleteUser,
    };
}
