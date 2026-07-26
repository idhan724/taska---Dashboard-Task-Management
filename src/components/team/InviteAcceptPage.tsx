import * as React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const mapErrorMessage = (raw: string) => {
  if (raw.includes("INVITE_EXPIRED"))
    return "This invitation link has expired. Please ask the sender to create a new link.";
  if (raw.includes("INVALID_TOKEN")) return "Invalid invitation link.";
  return raw;
};

export default function InviteAcceptPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { acceptInviteLink, previewInviteLink, isAcceptingInvite } =
    useWorkspaceStore();

  const [status, setStatus] = React.useState<
    "loading" | "ready" | "accepting" | "error"
  >(() => (token ? "loading" : "error"));
  const [errorMessage, setErrorMessage] = React.useState(() =>
    token
      ? ""
      : "This invitation link is incomplete. Please ask the sender to resend it.",
  );
  const [workspaceName, setWorkspaceName] = React.useState("");
  const hasAccepted = React.useRef(false);

  const currentPath = `/invite/accept?token=${token ?? ""}`;

  React.useEffect(() => {
    if (!token) return;

    previewInviteLink(token)
      .then((preview) => {
        setWorkspaceName(preview.workspaceName);
        setStatus("ready");
      })
      .catch((err) => {
        const raw =
          err instanceof Error ? err.message : "Invalid invitation link.";
        setErrorMessage(mapErrorMessage(raw));
        setStatus("error");
      });
  }, []);

  React.useEffect(() => {
    if (status !== "ready" || !user || !token || hasAccepted.current) return;
    hasAccepted.current = true;

    const run = async () => {
      setStatus("accepting");
      try {
        const workspaceId = await acceptInviteLink(token);
        toast.success(`Successfully joined the workspace "${workspaceName}"`);
        navigate(workspaceId ? `/${workspaceId}` : "/", { replace: true });
      } catch (err) {
        const raw =
          err instanceof Error ? err.message : "Failed to process invitation";
        setErrorMessage(mapErrorMessage(raw));
        setStatus("error");
      }
    };

    run();
  }, [status, user]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Checking the invite link...</CardTitle>
            <CardDescription />
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-muted-foreground">
            <Spinner />
            Wait a moment.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitation cannot be processed</CardTitle>
            <CardDescription />
          </CardHeader>
          <CardContent>{errorMessage}</CardContent>
        </Card>
      </div>
    );
  }

  if (status === "accepting" || isAcceptingInvite) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4 ">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Join the workspace...</CardTitle>
            <CardDescription />
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-muted-foreground">
            {" "}
            <Spinner />
            Please wait a moment, you will be redirected automatically.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            You are invited to the workspace {workspaceName}
          </CardTitle>
          <CardDescription />
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            Login or register first to join as a member.
          </p>
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link to="/login" state={{ from: currentPath }}>
                Login
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/signup" state={{ from: currentPath }}>
                Register
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
