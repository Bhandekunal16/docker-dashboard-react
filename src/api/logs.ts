import { apiClient } from './client';
import { ContainerLogsRequest, ContainerLogsResponse } from '../types/logs';

export async function fetchContainerLogs(payload: ContainerLogsRequest): Promise<ContainerLogsResponse> {
  const response = await apiClient.post<ContainerLogsResponse>('/logs/container', {
    containerId: payload.containerId,
    timestamps: payload.timestamps ?? false,
    tail: payload.tail ?? 200,
  });
  return response.data;
}
