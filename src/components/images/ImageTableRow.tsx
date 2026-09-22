import React, { useState } from 'react';
import { Trash2, Copy, Check, Info } from 'lucide-react';
import { DockerImage } from '../../types/image';
import { TagBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { getShortId } from '../../utils/formatters';
import { useConfig } from '../../context/ConfigContext';

interface ImageTableRowProps {
  image: DockerImage;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onRemove: (image: DockerImage) => void;
  isRemoving?: boolean;
}

export const ImageTableRow: React.FC<ImageTableRowProps> = ({
  image,
  isSelected,
  onToggleSelect,
  onRemove,
  isRemoving,
}) => {
  const { addToast } = useConfig();
  const [isCopiedId, setIsCopiedId] = useState(false);

  const handleCopyId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(image.ID);
      setIsCopiedId(true);
      addToast('info', 'ID Copied', `Image ID ${getShortId(image.ID)} copied.`);
      setTimeout(() => setIsCopiedId(false), 2000);
    } catch {
      // ignore
    }
  };

  const shortId = getShortId(image.ID);
  const shortDigest = image.Digest ? getShortId(image.Digest, 16) : '-';

  return (
    <tr
      className={`hover:bg-zinc-800/40 transition-colors group cursor-pointer text-xs border-b border-zinc-800/60 ${
        isSelected ? 'bg-blue-950/20' : ''
      }`}
      onClick={() => onToggleSelect(image.ID)}
    >
      {/* Checkbox */}
      <td className="py-2.5 px-3 w-10 text-center" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(image.ID)}
          className="w-3.5 h-3.5 rounded bg-zinc-950 border-zinc-700 text-blue-600 focus:ring-blue-500/50 cursor-pointer"
          aria-label={`Select image ${image.Tag || image.ID}`}
        />
      </td>

      {/* Tag */}
      <td className="py-2.5 px-3.5 max-w-[240px]">
        <TagBadge tag={image.Tag || '<none>'} maxWidth="max-w-[200px]" />
      </td>

      {/* Image ID */}
      <td className="py-2.5 px-3.5 font-mono text-[11px] text-zinc-400 whitespace-nowrap w-28">
        <div className="flex items-center gap-1">
          <span className="font-mono tracking-wider select-all" title={image.ID}>
            {shortId}
          </span>
          <button
            onClick={handleCopyId}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-opacity cursor-pointer"
            title="Copy image ID"
            aria-label="Copy image ID"
          >
            {isCopiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </td>

      {/* Size */}
      <td className="py-2.5 px-3.5 font-mono text-xs text-zinc-200 whitespace-nowrap">
        <div>{image.Size || '-'}</div>
        {(image.UniqueSize || image.Shared_Size) && (
          <div className="text-[10px] text-zinc-500">
            {image.UniqueSize ? `U: ${image.UniqueSize}` : ''}{' '}
            {image.Shared_Size ? `S: ${image.Shared_Size}` : ''}
          </div>
        )}
      </td>

      {/* Containers using this image */}
      <td className="py-2.5 px-3.5 font-mono text-xs whitespace-nowrap">
        <span
          className={`inline-flex items-center px-1.5 py-0.2 rounded text-[11px] font-semibold ${
            image.Containers > 0
              ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
              : 'bg-zinc-850 text-zinc-400'
          }`}
        >
          {image.Containers}
        </span>
      </td>

      {/* Created */}
      <td className="py-2.5 px-3.5 text-xs whitespace-nowrap">
        <div className="text-zinc-300">{image.Created_Since || '-'}</div>
        {image.Created_At && (
          <div className="text-[10px] text-zinc-500 font-mono">{image.Created_At}</div>
        )}
      </td>

      {/* Digest */}
      <td className="py-2.5 px-3.5 font-mono text-[11px] text-zinc-500 whitespace-nowrap max-w-[130px] truncate">
        <span title={image.Digest || '-'}>{shortDigest}</span>
      </td>

      {/* Actions */}
      <td className="py-2.5 px-3.5 text-right whitespace-nowrap w-24" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onRemove(image)}
          disabled={isRemoving}
          className="p-1.5 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/40 transition-colors cursor-pointer disabled:opacity-50"
          title="Remove image"
          aria-label="Remove image"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
};
