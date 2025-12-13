import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type ChatMessage = Tables<"chat_messages">;
type ChatMessageInsert = Omit<TablesInsert<"chat_messages">, "user_id">;

export function useChatMessages() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Fetch messages on mount
    useEffect(() => {
        if (!user) {
            setMessages([]);
            setLoading(false);
            return;
        }

        async function fetchMessages() {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from("chat_messages")
                    .select("*")
                    .eq("user_id", user!.id)
                    .order("created_at", { ascending: true });

                if (error) throw error;
                setMessages(data || []);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        }

        fetchMessages();

        // Subscribe to real-time updates
        const channel = supabase
            .channel("chat_messages_changes")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_messages",
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new as ChatMessage]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const addMessage = useCallback(
        async (message: ChatMessageInsert) => {
            if (!user) return { error: new Error("Not authenticated") };

            try {
                const { data, error } = await supabase
                    .from("chat_messages")
                    .insert({ ...message, user_id: user.id })
                    .select()
                    .single();

                if (error) throw error;

                // Only add if not already added by realtime subscription
                setMessages((prev) => {
                    if (prev.some((m) => m.id === data.id)) return prev;
                    return [...prev, data];
                });

                return { data, error: null };
            } catch (err) {
                return { data: null, error: err as Error };
            }
        },
        [user]
    );

    const clearMessages = useCallback(async () => {
        if (!user) return { error: new Error("Not authenticated") };

        try {
            const { error } = await supabase
                .from("chat_messages")
                .delete()
                .eq("user_id", user.id);

            if (error) throw error;
            setMessages([]);
            return { error: null };
        } catch (err) {
            return { error: err as Error };
        }
    }, [user]);

    return { messages, loading, error, addMessage, clearMessages };
}
