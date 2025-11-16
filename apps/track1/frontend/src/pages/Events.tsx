export default function Events() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Event Logs</h2>
      <p className="text-sm text-slate-600">
        For the hackathon reference implementation, view events using your favorite explorer
        or extend this page to stream events with viem (getLogs / watchContractEvent).
      </p>
      <ul className="list-disc list-inside text-sm text-slate-700">
        <li>Deposit(address from, uint256 amount)</li>
        <li>RecipientAdded(address wallet, uint256 share)</li>
        <li>RecipientUpdated(address wallet, uint256 oldShare, uint256 newShare)</li>
        <li>RecipientRemoved(address wallet)</li>
        <li>DistributionExecuted(uint256 totalDistributed, uint256 timestamp)</li>
      </ul>
    </div>
  );
}


