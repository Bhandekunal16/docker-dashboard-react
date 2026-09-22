import { ContainerStateCategory } from '../types/container';

export function getShortId(id: string, length = 12): string {
  if (!id) return '';
  // If id is in format sha256:abc...
  const cleanId = id.startsWith('sha256:') ? id.slice(7) : id;
  return cleanId.length > length ? cleanId.slice(0, length) : cleanId;
}

export function parseContainerStatus(statusStr: string): {
  category: ContainerStateCategory;
  label: string;
  isUp: boolean;
} {
  if (!statusStr) {
    return { category: 'other', label: 'Unknown', isUp: false };
  }

  const lower = statusStr.toLowerCase();

  if (lower.startsWith('up') || lower.includes('running')) {
    return { category: 'running', label: statusStr, isUp: true };
  }
  if (lower.startsWith('restart') || lower.includes('restarting')) {
    return { category: 'restarting', label: statusStr, isUp: false };
  }
  if (lower.startsWith('pause') || lower.includes('paused')) {
    return { category: 'paused', label: statusStr, isUp: false };
  }
  if (lower.startsWith('exited') || lower.includes('stop') || lower.startsWith('created') || lower.startsWith('dead')) {
    return { category: 'stopped', label: statusStr, isUp: false };
  }

  return { category: 'other', label: statusStr, isUp: false };
}

export function formatPorts(portsStr: string): Array<{ host: string; container: string; protocol: string }> {
  if (!portsStr || portsStr.trim() === '') return [];

  // e.g., "0.0.0.0:8080->80/tcp, :::8080->80/tcp" or "80/tcp"
  const parts = portsStr.split(',').map((p) => p.trim()).filter(Boolean);
  const result: Array<{ host: string; container: string; protocol: string }> = [];

  for (const part of parts) {
    if (part.includes('->')) {
      const [hostPart, containerPart] = part.split('->');
      const [contPort, protocol = 'tcp'] = (containerPart || '').split('/');
      result.push({
        host: hostPart || '',
        container: contPort || '',
        protocol,
      });
    } else {
      const [contPort, protocol = 'tcp'] = part.split('/');
      result.push({
        host: '-',
        container: contPort || '',
        protocol,
      });
    }
  }

  return result;
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return dateStr;
    }
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}
