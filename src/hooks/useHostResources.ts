import { useQuery } from '@tanstack/react-query';
import { fetchHostResources } from '../api/hostResources';

export const HOST_RESOURCES_QUERY_KEY = ['host-resources'] as const;

export function useHostResources() {
  return useQuery({
    queryKey: HOST_RESOURCES_QUERY_KEY,
    queryFn: fetchHostResources,
    refetchInterval: 4000,
    retry: 2,
  });
}
