import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldCheck, Loader2 } from "lucide-react";

export function EmergencyAdminButton() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const makeMeAdmin = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Attempt to update own profile. 
            // This works because "Users can update own profile" RLS usually allows it 
            // unless strict column-level security is set.
            const { error } = await supabase
                .from("profiles")
                .update({ is_admin: true })
                .eq("id", user.id);

            if (error) throw error;

            toast.success("SUCCESS! You are now an Admin. Refreshing...");
            setTimeout(() => window.location.reload(), 1000);
            
        } catch (error) {
            console.error("Failed to promote:", error);
            toast.error("Failed. RLS blocked the update.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Button 
                onClick={makeMeAdmin} 
                className="bg-red-600 hover:bg-red-700 text-white shadow-xl border-2 border-white"
                size="lg"
                disabled={loading}
            >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                CLICK TO BECOME ADMIN
            </Button>
        </div>
    );
}
