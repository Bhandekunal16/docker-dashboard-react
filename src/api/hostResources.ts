import { apiClient } from './client';

export interface CpuUsage {
  usagePercent: number;
  cores: number;
}

export interface MemoryUsage {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  usagePercent: number;
}

export interface DiskUsage {
  mount: string;
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  usagePercent: number;
}

export async function fetchHostResources() {
  const [cpu, memory, disk] = await Promise.all([
    apiClient.get<CpuUsage>('/api/host/cpu'),
    apiClient.get<MemoryUsage>('/api/host/memory'),
    apiClient.get<DiskUsage>('/api/host/disk'),
  ]);
  return { cpu: cpu.data, memory: memory.data, disk: disk.data };
}
