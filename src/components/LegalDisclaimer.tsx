import { useState } from "react";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const LegalDisclaimer = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-2 right-2 z-50">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 transition-opacity"
          >
            <Info className="h-3 w-3 mr-1" />
            Legal
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Legal Disclaimer & Terms of Service</DialogTitle>
            <DialogDescription>
              Please read the following terms and conditions carefully.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 text-sm">
              <section>
                <h3 className="font-semibold mb-2">1. Terms of Service</h3>
                <p className="text-muted-foreground mb-2">
                  By using this wallet service, you agree to be bound by these Terms of Service.
                  If you do not agree to these terms, please do not use this service.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">2. Compliance & Regulatory Requirements</h3>
                <p className="text-muted-foreground mb-2">
                  This service is subject to applicable laws and regulations, including but not
                  limited to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Anti-Money Laundering (AML) regulations</li>
                  <li>Know Your Customer (KYC) requirements</li>
                  <li>Know Your Business (KYB) requirements</li>
                  <li>Sanctions screening obligations</li>
                  <li>Financial services regulations</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold mb-2">3. Identity Verification</h3>
                <p className="text-muted-foreground mb-2">
                  You may be required to complete KYC (for individuals) or KYB (for businesses)
                  verification. We reserve the right to request additional documentation at any
                  time. Failure to provide requested documentation may result in account
                  restrictions or closure.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">4. Sanctions Screening</h3>
                <p className="text-muted-foreground mb-2">
                  All users, transactions, and addresses are screened against applicable sanctions
                  lists. Transactions involving sanctioned entities or addresses will be blocked.
                  We are required to comply with all applicable sanctions laws and regulations.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">5. Transaction Monitoring</h3>
                <p className="text-muted-foreground mb-2">
                  All transactions are monitored for compliance purposes. We may delay, block, or
                  reverse transactions that violate our terms of service or applicable laws.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">6. Data Collection & Privacy</h3>
                <p className="text-muted-foreground mb-2">
                  We collect and process personal information as required by law and for the
                  provision of our services. All data is stored securely in our database with
                  appropriate safeguards. We maintain audit logs of all activities for compliance
                  purposes.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">7. Limitation of Liability</h3>
                <p className="text-muted-foreground mb-2">
                  This service is provided "as is" without warranties of any kind. We are not
                  liable for any losses resulting from the use of this service, including but not
                  limited to transaction failures, network issues, or regulatory actions.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">8. Prohibited Activities</h3>
                <p className="text-muted-foreground mb-2">
                  You agree not to use this service for any illegal activities, including but not
                  limited to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Money laundering</li>
                  <li>Terrorism financing</li>
                  <li>Fraud or other financial crimes</li>
                  <li>Violations of sanctions laws</li>
                  <li>Any activity prohibited by applicable law</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold mb-2">9. Account Termination</h3>
                <p className="text-muted-foreground mb-2">
                  We reserve the right to suspend or terminate accounts that violate these terms,
                  fail compliance checks, or are involved in suspicious activities. We may be
                  required to report suspicious activities to relevant authorities.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">10. Changes to Terms</h3>
                <p className="text-muted-foreground mb-2">
                  We may update these terms at any time. Continued use of the service after
                  changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">11. Contact</h3>
                <p className="text-muted-foreground mb-2">
                  For questions about these terms or compliance matters, please contact our
                  compliance team.
                </p>
              </section>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setOpen(false)}>I Understand</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LegalDisclaimer;

