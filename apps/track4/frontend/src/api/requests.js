import { apiClient } from "./client";

export const requestAPI = {
  create: (payload) => apiClient.post("/requests/create", payload),
  get: (id) => apiClient.get(`/requests/${id}`),
  pay: (id) => apiClient.post(`/requests/${id}/pay`),
};

