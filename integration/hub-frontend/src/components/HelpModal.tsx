import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Wallet, ArrowRightLeft, PiggyBank, FileCode } from "lucide-react";
import { PropsWithChildren } from "react";

export default function HelpModal(props: PropsWithChildren<{ triggerClassName?: string }>) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className={props.triggerClassName}>
          <HelpCircle className="h-4 w-4 mr-2" />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Noah’s Arc – Unified Web3 Financial Control Center</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground space-y-3">
          <p>
            Noah’s Arc is a modular Web3 finance operating system powered by Arc + Circle. Each module is a fully isolated app:
          </p>
          <ul className="pl-0 space-y-2">
            <li className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              <span><strong>Embedded Wallet</strong> – Arc Cloud Wallet (Track 4)</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-accent" />
              <span><strong>Cross-Chain Bridge</strong> – Arc Cross-Chain Teleporter (Track 2)</span>
            </li>
            <li className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4 text-primary" />
              <span><strong>Treasury Automation</strong> – Autonomous Treasury Engine (Track 3)</span>
            </li>
            <li className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-accent" />
              <span><strong>Smart Contracts Playground</strong> – Programmable Money Studio (Track 1)</span>
            </li>
          </ul>
          <p>
            The Integration Hub embeds each module via secure iframes and clean routing, preserving isolation with Web2-smooth UX.
          </p>
          <p className="text-xs">
            Tech: shadcn/ui, framer-motion, React Router, Arc testnet, Circle Wallets, CCTP, Gateway. No backend mixing – pure UI/UX orchestration.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}


