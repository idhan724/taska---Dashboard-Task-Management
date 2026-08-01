import * as React from "react";
import { isLiveMode, supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle } from "lucide-react";

export default function AccountTabs() {
  const { profile, updateProfile, updatePassword } = useAuthStore();
  const [name, setName] = React.useState(profile?.full_name ?? "");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isOAuthUser, setIsOAuthUser] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const checkProvider = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setIsOAuthUser(user?.app_metadata?.provider !== "email");
      } catch (err) {
        console.error("Failed to check auth provider:", err);
      }
    };

    checkProvider();
  }, []);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (newPassword) {
        if (newPassword.length < 6) {
          toast.error("New password must be at least 6 characters");
          return;
        }
        if (newPassword !== confirmPassword) {
          toast.error("Passwords don't match");
          return;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: profile!.email,
          password: currentPassword,
        });
        if (signInError) {
          toast.error("Current password is incorrect");
          return;
        }

        await updatePassword(newPassword);
      }

      await updateProfile(profile!.id, { full_name: name });

      if (newPassword) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Name and password updated");
      } else if (name !== profile?.full_name) {
        toast.success("Name updated");
      }
    } catch {
      toast.error(useAuthStore.getState().error ?? "Failed to update users");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Display name</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          This name is visible to your teammates across all workspaces.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="full-name"
          >
            Full name
          </Label>
          <Input
            id="full-name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        {!isLiveMode ? (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle
              size={15}
              className="text-amber-600 mt-0.5 shrink-0"
            />
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-amber-800">
                Live mode only
              </p>
              <p className="text-xs text-amber-700">
                Password changes require Supabase. Add{" "}
                <code className="font-mono bg-amber-100 px-1 rounded">
                  VITE_SUPABASE_URL
                </code>{" "}
                and{" "}
                <code className="font-mono bg-amber-100 px-1 rounded">
                  VITE_SUPABASE_ANON_KEY
                </code>{" "}
                to your{" "}
                <code className="font-mono bg-amber-100 px-1 rounded">
                  .env
                </code>{" "}
                to enable this.
              </p>
            </div>
          </div>
        ) : isOAuthUser ? (
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <AlertTriangle
              size={15}
              className="text-blue-600 mt-0.5 shrink-0"
            />
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-blue-800">
                Signed in with GitHub
              </p>
              <p className="text-xs text-blue-700">
                You're signed in using GitHub, so there's no password to change
                here. Manage your password directly through your GitHub account.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="current-pw">Current password</Label>
              <Input
                id="current-pw"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="********"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pw">New Password</Label>
              <Input
                id="new-pw"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="********"
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pw">Confirm new password</Label>
              <Input
                id="confirm-pw"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
                minLength={6}
              />
            </div>
          </>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              {" "}
              <Spinner />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </form>
    </div>
  );
}
