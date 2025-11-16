import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PropsWithChildren } from "react";

export default function ApprovalModal({
  onConfirm
}: PropsWithChildren<{ onConfirm?: () => void }>) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Approval Flow</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Treasury Approval</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground space-y-3">
          <p>
            This UI wraps the approval step. It is read-only by default and should
            call your existing backend/gateway logic when you connect it.
          </p>
          <Button onClick={onConfirm} className="w-full">
            Confirm Approval
          </Button>
          <div className="text-xs">
            Note: This does not modify backend logic. It is a UX shell to connect to
            your already-implemented approval endpoint.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


