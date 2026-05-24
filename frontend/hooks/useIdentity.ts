"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi, scansApi } from "@/lib/api/endpoints";
import { IdentityProfile } from "@/types";

export function useIdentityProfiles() {
  return useQuery({
    queryKey: ["identity", "profiles"],
    queryFn: () => identityApi.getProfiles(),
  });
}

export function useIdentityProfile(id: number) {
  return useQuery({
    queryKey: ["identity", "profiles", id],
    queryFn: () => identityApi.getProfile(id),
    enabled: !!id,
  });
}

export function useCreateProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<IdentityProfile>) => identityApi.createProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["identity"] });
    },
  });
}

export function useUploadProfilePhoto() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ profileId, file }: { profileId: number; file: File }) =>
      identityApi.uploadPhoto(profileId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["identity"] });
    },
  });
}

export function useFaceCompare() {
  return useMutation({
    mutationFn: ({ img1, img2 }: { img1: File; img2: File }) =>
      scansApi.compareFaces(img1, img2),
  });
}

export function useDeepfakeDetect() {
  return useMutation({
    mutationFn: (image: File) => scansApi.detectDeepfake(image),
  });
}

export function useEmailLeakCheck() {
  return useMutation({
    mutationFn: (email: string) => scansApi.checkEmailLeak(email),
  });
}

export function useOSINTScan() {
  return useMutation({
    mutationFn: ({ query, scanType }: { query: string; scanType: string }) =>
      scansApi.runOSINT(query, scanType),
  });
}

export function useFakeProfileDetect() {
  return useMutation({
    mutationFn: (url: string) => scansApi.detectFakeProfile(url),
  });
}
