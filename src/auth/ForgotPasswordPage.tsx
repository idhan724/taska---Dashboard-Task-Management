import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/store/authStore";
import * as React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const { sendPasswordResetEmail } = useAuthStore();
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSent, setIsSent] = React.useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(email.trim());
      setIsSent(true);
    } catch {
      toast.error(
        useAuthStore.getState().error ?? "Failed to send reset email",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center gap-2">
          <div className="flex items-center justify-center gap-2 mb-7">
            <img src="/favicon.svg" alt="taska" className="w-5 h-5" />
            <span className="text-lg font-bold">Taska</span>
          </div>
          <CardTitle className="text-xl">Reset password</CardTitle>
          <CardDescription>
            {isSent
              ? "Check your email."
              : "Enter your email account,we will send you a link"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {isSent ? (
            <p className="text-sm text-muted-foreground text-center">
              password reset link has been sent.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner /> Sending...
                    </>
                  ) : (
                    "Sending reset password link"
                  )}
                </Button>
              </div>
            </form>
          )}
          <p className="text-center text-sm font-medium text-primary hover:underline">
            <Link to="/login">Back to login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
