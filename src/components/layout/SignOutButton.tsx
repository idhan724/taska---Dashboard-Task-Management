import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { isLiveMode, setForceMockMode } from "@/lib/supabase";

export default function SignOutButton() {
  const { signOut } = useAuthStore();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(useAuthStore.getState().error ?? "Failed to sign out");
    } finally {
      setIsSigningOut(false);
    }
  };
  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button className="bg-background text-neutral-400 hover:text-red-500 hover:bg-red-50">
          <LogOut />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {isLiveMode
              ? "This will sign you out of your account."
              : "This will exit demo mode."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={
              isLiveMode
                ? (e) => {
                    e.preventDefault();
                    handleSignOut();
                  }
                : () => setForceMockMode(false)
            }
          >
            {isLiveMode ? (
              isSigningOut ? (
                <>
                  <Spinner /> logging out...
                </>
              ) : (
                "Logout"
              )
            ) : (
              "Leave Demo Mode"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
