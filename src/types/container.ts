export interface Container {
  container_id: string;
  image: string;
  status: string;
  ports: string;
  name: string;
}

export interface ContainerActionPayload {
  containerId: string;
}

export interface ContainerActionResponse {
  message: string;
  containerId: string;
  output: string;
}

export type ContainerStateCategory = 'running' | 'stopped' | 'restarting' | 'paused' | 'other';
