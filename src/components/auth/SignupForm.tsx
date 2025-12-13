import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { FormInput } from "./FormInput";
import { AuthButton } from "./AuthButton";
import { AuthCard, AuthCardHeader, AuthCardFooter } from "./AuthCard";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signupSchema.safeParse({ fullName, email, password, confirmPassword });
    if (!result.success) {
      const fieldErrors: { fullName?: string; email?: string; password?: string; confirmPassword?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof fieldErrors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error, needsEmailVerification } = await signUp(email, password, fullName);
    setLoading(false);

    if (error) {
      if (error.message.includes("User already registered")) {
        toast.error("An account with this email already exists");
      } else {
        toast.error(error.message);
      }
      return;
    }

    if (needsEmailVerification) {
      toast.success("Please check your email to verify your account!", {
        description: `We sent a verification link to ${email}`,
        duration: 10000,
      });
      // Don't navigate - user needs to verify email first
    } else {
      // Email verification is disabled in Supabase, auto-login happened
      toast.success("Account created successfully!");
      navigate("/");
    }
  };

  return (
    <AuthCard>
      <AuthCardHeader
        title="Create Account"
        description="Get started with your free account"
      />
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          autoComplete="name"
        />
        <FormInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
        />
        <FormInput
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="new-password"
        />
        <FormInput
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
        <AuthButton type="submit" loading={loading}>
          Create Account
        </AuthButton>
      </form>
      <AuthCardFooter>
        Already have an account?{" "}
        <button
          onClick={onSwitchToLogin}
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Sign in
        </button>
      </AuthCardFooter>
    </AuthCard>
  );
}
