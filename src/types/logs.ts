export interface ContainerLogsRequest {
  containerId: string;
  timestamps?: boolean;
  tail?: number;
}

export interface ContainerLogsResponse {
  containerId: string;
  logs: string;
}
