import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Notification, QuestionRecord } from "../backend";
import { useActor } from "./useActor";

export function useIsParentPinSet() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isParentPinSet"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isParentPinSet();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetParentPin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pin: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.setParentPin(pin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isParentPinSet"] });
    },
  });
}

export function useAuthenticateParentMode() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (pin: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.authenticateParentMode(pin);
    },
  });
}

export function useRecordQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (question: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.recordQuestion(question);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questionHistory"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });
}

export function useQuestionHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<QuestionRecord[]>({
    queryKey: ["questionHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getQuestionHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUnreadNotificationCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["unreadCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getUnreadNotificationCount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMarkAllNotificationsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.markAllNotificationsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });
}
