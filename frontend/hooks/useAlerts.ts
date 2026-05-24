"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertsApi } from "@/lib/api/endpoints";

export function useAlerts(params?: { skip?: number; limit?: number; unread_only?: boolean }) {
  return useQuery({
    queryKey: ["alerts", params],
    queryFn: () => alertsApi.getAlerts(params),
    refetchInterval: 30000,
  });
}

export function useAlertStats() {
  return useQuery({
    queryKey: ["alerts", "stats"],
    queryFn: () => alertsApi.getStats(),
    refetchInterval: 30000,
  });
}

export function useMarkAlertRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => alertsApi.updateAlert(id, { is_read: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useMarkAllAlertsRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => alertsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}
