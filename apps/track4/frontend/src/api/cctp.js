import { apiClient } from "./client";

export const cctpAPI = {
  createIntent: (amount) => apiClient.post("/cctp/intent", { amount }),
  executeBurn: (payload) => apiClient.post("/cctp/transfer", payload),
  pollAttestation: (payload) => apiClient.post("/cctp/attestation", payload),
  executeMint: (payload) => apiClient.post("/cctp/receive", payload),
};

