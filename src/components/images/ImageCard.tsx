import React, { useState } from 'react';
import { Trash2, Copy, Check } from 'lucide-react';
import { DockerImage } from '../../types/image';
import { TagBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { getShortId } from '../../utils/formatters';
import { useConfig } from '../../context/ConfigContext';

interface ImageCardProps {
  image: DockerImage;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onRemove: (image: DockerImage) => void;
  isRemoving?: boolean;
}

export const ImageCard: React.FC<ImageCardProps> = ({
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

  return (
    <div
      onClick={() => onToggleSelect(image.ID)}
      className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
        isSelected
          ? 'bg-blue-950/20 border-blue-600/60 shadow-xs shadow-blue-900/20'
          : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(image.ID)}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 rounded bg-zinc-950 border-zinc-700 text-blue-600 focus:ring-blue-500/50 cursor-pointer"
            aria-label={`Select image ${image.Tag}`}
          />
          <div>
            <TagBadge tag={image.Tag || '<none>'} />
            <div className="flex items-center gap-1.5 mt-1 font-mono text-[11px] text-zinc-500">
              <span>{getShortId(image.ID)}</span>
              <button
                onClick={handleCopyId}
                className="p-0.5 hover:text-zinc-300"
                aria-label="Copy image ID"
              >
                {isCopiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(image);
          }}
          isLoading={isRemoving}
          className="text-zinc-400 hover:text-rose-400 hover:bg-rose-950/60"
          title="Remove image"
          aria-label="Remove image"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-zinc-800/80">
        <div>
          <span className="text-[11px] text-zinc-500 uppercase font-semibold">Size:</span>
          <div className="font-mono text-zinc-200">{image.Size || '-'}</div>
        </div>
        <div>
          <span className="text-[11px] text-zinc-500 uppercase font-semibold">Containers:</span>
          <div className="font-mono text-zinc-200">{image.Containers} active</div>
        </div>
        <div className="col-span-2">
          <span className="text-[11px] text-zinc-500 uppercase font-semibold">Created:</span>
          <div className="text-zinc-300 text-xs">{image.Created_Since || '-'}</div>
        </div>
      </div>
    </div>
  );
};
