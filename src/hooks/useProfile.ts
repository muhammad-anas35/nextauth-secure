import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type ProfileUpdate = TablesUpdate<"profiles">;

export function useProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }

        async function fetchProfile() {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user!.id)
                    .single();

                if (error) throw error;
                setProfile(data);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [user]);

    const updateProfile = async (updates: ProfileUpdate) => {
        if (!user) return { error: new Error("Not authenticated") };

        try {
            const { data, error } = await supabase
                .from("profiles")
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq("id", user.id)
                .select()
                .single();

            if (error) throw error;
            setProfile(data);
            return { data, error: null };
        } catch (err) {
            return { data: null, error: err as Error };
        }
    };

    return { profile, loading, error, updateProfile };
}
