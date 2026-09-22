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

export function formatPorts(portsStr: string): Array<{
  host: string;
  container: string;
  protocol: string;
  display: string;
}> {
  if (!portsStr || portsStr.trim() === '') return [];

  // e.g., "0.0.0.0:1026->1025/tcp, [::]:1026->1025/tcp, 0.0.0.0:8026->8025/tcp, [::]:8026->8025/tcp" or "80/tcp"
  const rawParts = portsStr.split(',').map((p) => p.trim()).filter(Boolean);
  const seenMap = new Map<string, { host: string; container: string; protocol: string; display: string }>();

  for (const part of rawParts) {
    if (part.includes('->')) {
      const [hostPart, containerPart] = part.split('->');
      const [contPort, protocol = 'tcp'] = (containerPart || '').split('/');

      // Extract host port and host IP
      // Examples of hostPart: "0.0.0.0:1026", "[::]:1026", ":::1026", "127.0.0.1:8080", "1026"
      let hostIp = '';
      let hostPort = hostPart;

      if (hostPart.includes(':')) {
        const lastColonIdx = hostPart.lastIndexOf(':');
        hostIp = hostPart.slice(0, lastColonIdx).replace(/^\[|\]$/g, '');
        hostPort = hostPart.slice(lastColonIdx + 1);
      }

      // Key for deduplication based on port mapping
      const isWildcardIp = !hostIp || hostIp === '0.0.0.0' || hostIp === '::' || hostIp === ':::';
      const key = `${hostPort}->${contPort}/${protocol}`;

      // Clean display string
      let display = '';
      if (!isWildcardIp && hostIp) {
        display = `${hostIp}:${hostPort} → ${contPort}`;
      } else if (hostPort === contPort) {
        display = `${hostPort}:${contPort}`;
      } else {
        display = `${hostPort} → ${contPort}`;
      }

      if (!seenMap.has(key)) {
        seenMap.set(key, {
          host: hostPart || '-',
          container: contPort || '',
          protocol,
          display,
        });
      }
    } else {
      const [contPort, protocol = 'tcp'] = part.split('/');
      const key = `container-${contPort}/${protocol}`;
      if (!seenMap.has(key)) {
        seenMap.set(key, {
          host: '-',
          container: contPort || '',
          protocol,
          display: `${contPort}/${protocol}`,
        });
      }
    }
  }

  return Array.from(seenMap.values());
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
