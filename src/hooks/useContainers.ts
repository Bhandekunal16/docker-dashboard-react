import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchContainers,
  startContainer,
  stopContainer,
  restartContainer,
  removeContainer,
} from '../api/containers';
import { Container, ContainerActionPayload } from '../types/container';
import { parseApiErrorMessage } from '../api/client';
import { useConfig } from '../context/ConfigContext';

export const CONTAINERS_QUERY_KEY = ['containers'] as const;

export function useContainers() {
  const { setConnectionStatus } = useConfig();

  return useQuery<Container[], Error>({
    queryKey: CONTAINERS_QUERY_KEY,
    queryFn: async () => {
      try {
        const data = await fetchContainers();
        setConnectionStatus('connected');
        return data;
      } catch (err) {
        setConnectionStatus('error');
        throw err;
      }
    },
    refetchInterval: 10000,
    retry: 2,
  });
}

export function useContainerMutations() {
  const queryClient = useQueryClient();
  const { addToast } = useConfig();

  const startMutation = useMutation({
    mutationFn: (payload: ContainerActionPayload) => startContainer(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: CONTAINERS_QUERY_KEY });
      addToast(
        'success',
        'Container Started',
        data.message || `Container ${variables.containerId} was started successfully.`
      );
    },
    onError: (err: unknown) => {
      const msg = parseApiErrorMessage(err);
      addToast('error', 'Failed to Start Container', msg);
    },
  });

  const stopMutation = useMutation({
    mutationFn: (payload: ContainerActionPayload) => stopContainer(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: CONTAINERS_QUERY_KEY });
      addToast(
        'success',
        'Container Stopped',
        data.message || `Container ${variables.containerId} was stopped successfully.`
      );
    },
    onError: (err: unknown) => {
      const msg = parseApiErrorMessage(err);
      addToast('error', 'Failed to Stop Container', msg);
    },
  });

  const restartMutation = useMutation({
    mutationFn: (payload: ContainerActionPayload) => restartContainer(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: CONTAINERS_QUERY_KEY });
      addToast(
        'success',
        'Container Restarted',
        data.message || `Container ${variables.containerId} was restarted successfully.`
      );
    },
    onError: (err: unknown) => {
      const msg = parseApiErrorMessage(err);
      addToast('error', 'Failed to Restart Container', msg);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (payload: ContainerActionPayload) => removeContainer(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: CONTAINERS_QUERY_KEY });
      addToast(
        'success',
        'Container Removed',
        data.message || `Container ${variables.containerId} was removed successfully.`
      );
    },
    onError: (err: unknown) => {
      const msg = parseApiErrorMessage(err);
      addToast('error', 'Failed to Remove Container', msg);
    },
  });

  return {
    startContainer: startMutation.mutateAsync,
    isStarting: startMutation.isPending,
    startingContainerId: startMutation.variables?.containerId,

    stopContainer: stopMutation.mutateAsync,
    isStopping: stopMutation.isPending,
    stoppingContainerId: stopMutation.variables?.containerId,

    restartContainer: restartMutation.mutateAsync,
    isRestarting: restartMutation.isPending,
    restartingContainerId: restartMutation.variables?.containerId,

    removeContainer: removeMutation.mutateAsync,
    isRemoving: removeMutation.isPending,
    removingContainerId: removeMutation.variables?.containerId,
  };
}
