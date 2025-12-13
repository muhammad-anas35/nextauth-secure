import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface Profile {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

export function useProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const updateName = async (newName: string) => {
        if (!user) return { error: new Error("Not authenticated") };

        try {
            const { error } = await supabase
                .from("profiles")
                .update({ full_name: newName, updated_at: new Date().toISOString() })
                .eq("id", user.id);

            if (error) throw error;

            // Update local state
            setProfile((prev) => (prev ? { ...prev, full_name: newName } : null));

            // Also update user metadata
            await supabase.auth.updateUser({
                data: { full_name: newName }
            });

            toast.success("Name updated successfully!");
            return { error: null };
        } catch (error) {
            console.error("Error updating name:", error);
            toast.error("Failed to update name");
            return { error: error as Error };
        }
    };

    return { profile, loading, updateName, refetch: fetchProfile };
}
