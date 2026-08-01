import * as React from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { SiGithub } from "@icons-pack/react-simple-icons";

export default function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signInWithGithub } = useAuthStore();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isSubmitting, setSubmitting] = React.useState(false);
  const [isGithubLoading, setGithubLoading] = React.useState(false);

  if (user) {
    const redirectTo =
      (location.state as { from?: string } | null)?.from ?? "/";
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError("Email and password are required.");
      return;
    }

    setSubmitting(true);
    try {
      await signIn(email, password);
      toast.success("Successfully signed in!");
      navigate("/", { replace: true });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to sign in. Please try again.";
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGithubSignIn = async () => {
    setGithubLoading(true);
    try {
      await signInWithGithub();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to continue with Github";
      setFormError(message);
      toast.error(message);
    } finally {
      setGithubLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center gap-2">
          <div className="flex items-center justify-center gap-2 mb-7">
            <img src="/favicon.svg" alt="Taska" className="w-5 h-5" />
            <span className="text-lg font-bold">Taska</span>
          </div>
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Manage your tasks and projects in one place.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Button
            variant="outline"
            onClick={handleGithubSignIn}
            disabled={isGithubLoading}
          >
            {isGithubLoading ? <Spinner /> : <SiGithub />}
            Sign in with GitHub
          </Button>

          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground whitespace-nowrap uppercase">
              or continue with
            </span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                aria-invalid={!!formError}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                aria-invalid={!!formError}
              />
            </div>
            <Link
              to="/forgot-password"
              className="text-xs text-muted-foreground hover:underline hover:text-blue-400"
            >
              Forgot password?
            </Link>

            {formError && (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              Sign In
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-primary hover:underline hover:text-blue-400"
            >
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
