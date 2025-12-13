import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { Loader2, ShieldX } from "lucide-react";

interface AdminRouteProps {
    children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
    const { user, loading: authLoading } = useAuth();
    const { isAdmin, loading: adminLoading } = useAdmin();

    // Show loading while checking auth and admin status
    if (authLoading || adminLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Redirect to auth if not logged in
    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    // Show access denied if not admin
    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4 text-center p-8">
                    <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center">
                        <ShieldX className="h-10 w-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
                    <p className="text-muted-foreground max-w-md">
                        You don't have permission to access this page.
                        This area is restricted to administrators only.
                    </p>
                    <a
                        href="/"
                        className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Return to Home
                    </a>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
