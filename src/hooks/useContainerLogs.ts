import { useQuery } from '@tanstack/react-query';
import { fetchContainerLogs } from '../api/logs';
import { ContainerLogsResponse } from '../types/logs';

interface UseContainerLogsOptions {
  containerId: string;
  timestamps?: boolean;
  tail?: number;
  enabled?: boolean;
  autoRefresh?: boolean;
  autoRefreshInterval?: number;
}

export function useContainerLogs({
  containerId,
  timestamps = false,
  tail = 200,
  enabled = true,
  autoRefresh = false,
  autoRefreshInterval = 3000,
}: UseContainerLogsOptions) {
  return useQuery<ContainerLogsResponse, Error>({
    queryKey: ['container-logs', containerId, timestamps, tail],
    queryFn: () => fetchContainerLogs({ containerId, timestamps, tail }),
    enabled: enabled && !!containerId,
    refetchInterval: autoRefresh ? autoRefreshInterval : false,
    retry: 1,
  });
}
