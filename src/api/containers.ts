import { apiClient } from './client';
import { Container, ContainerActionPayload, ContainerActionResponse } from '../types/container';

export async function fetchContainers(): Promise<Container[]> {
  const response = await apiClient.get<Container[]>('/get/all/containers');
  return Array.isArray(response.data) ? response.data : [];
}

export async function startContainer(payload: ContainerActionPayload): Promise<ContainerActionResponse> {
  const response = await apiClient.post<ContainerActionResponse>('/start/container', payload);
  return response.data;
}

export async function stopContainer(payload: ContainerActionPayload): Promise<ContainerActionResponse> {
  const response = await apiClient.post<ContainerActionResponse>('/stop/container', payload);
  return response.data;
}

export async function restartContainer(payload: ContainerActionPayload): Promise<ContainerActionResponse> {
  const response = await apiClient.post<ContainerActionResponse>('/restart/container', payload);
  return response.data;
}

export async function removeContainer(payload: ContainerActionPayload): Promise<ContainerActionResponse> {
  const response = await apiClient.post<ContainerActionResponse>('/remove/container', payload);
  return response.data;
}
