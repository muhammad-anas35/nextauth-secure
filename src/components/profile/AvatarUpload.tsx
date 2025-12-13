import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AvatarUploadProps {
    url: string | null;
    onUpload: (url: string) => void;
    fullName: string | null;
}

export function AvatarUpload({ url, onUpload, fullName }: AvatarUploadProps) {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error("You must select an image to upload.");
            }

            const file = event.target.files[0];
            const fileExt = file.name.split(".").pop();
            const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

            onUpload(data.publicUrl);
            toast.success("Avatar uploaded successfully!");
        } catch (error) {
            console.error("Error uploading avatar:", error);
            toast.error(error instanceof Error ? error.message : "Error uploading avatar");
        } finally {
            setUploading(false);
        }
    };

    const initials = fullName
        ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "U";

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                    <AvatarImage src={url || undefined} alt="Avatar" className="object-cover" />
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-violet-600 to-primary text-white">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                        <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                            {uploading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Upload className="h-5 w-5" />
                            )}
                        </div>
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={uploadAvatar}
                            disabled={uploading}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>
            <p className="text-sm text-muted-foreground">
                Click the upload icon to change your photo
            </p>
        </div>
    );
}
