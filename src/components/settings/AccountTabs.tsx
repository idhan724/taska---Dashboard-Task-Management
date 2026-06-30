import * as React from "react";
import { isLiveMode, supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AccountTabs() {
  const { profile, isLoading, updateProfile } = useAuthStore();
  const [name, setName] = React.useState(profile?.full_name ?? "");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await updateProfile(profile!.id, { full_name: name });

      if (newPassword) {
        if (newPassword.length < 8) {
          toast.error("New password must be at least 8 characters");
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

        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (passwordError) throw passwordError;

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Name and password updated");
        return;
      }

      toast.success("Name updated");
    } catch {
      toast.error(useAuthStore.getState().error ?? "Failed to update name");
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
            id="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        {isLiveMode ? (
          <>
            <div className="space-y-2">
              <Label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="current-pw"
              >
                Current password
              </Label>
              <Input
                id="current-pw"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="********"
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="new-pw"
              >
                New Password
              </Label>
              <Input
                id="new-pw"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="********"
                minLength={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="confirm-pw"
              >
                Confirm new password
              </Label>
              <Input
                id="confirm-pw"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
                minLength={8}
                required
              />
            </div>
          </>
        ) : (
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
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
