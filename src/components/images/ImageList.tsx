import React, { useState, useMemo } from 'react';
import { DockerImage } from '../../types/image';
import { ImageFilterBar } from './ImageFilterBar';
import { ImageTableRow } from './ImageTableRow';
import { ImageCard } from './ImageCard';
import { useImageMutations } from '../../hooks/useImages';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';

interface ImageListProps {
  images: DockerImage[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const ImageList: React.FC<ImageListProps> = ({ images, onRefresh, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'tag' | 'size' | 'containers' | 'created'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [imageToRemove, setImageToRemove] = useState<DockerImage | null>(null);
  const [isConfirmBatchOpen, setIsConfirmBatchOpen] = useState(false);

  const {
    removeImage,
    removeMultipleImages,
    isRemovingImage,
    isRemovingMultiple,
    removingImageId,
  } = useImageMutations();

  // Handle multi-select toggle
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredImages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredImages.map((img) => img.ID));
    }
  };

  // Helper to parse byte sizes for accurate numerical sorting
  const parseSizeToBytes = (sizeStr: string): number => {
    if (!sizeStr) return 0;
    const match = sizeStr.trim().match(/^([0-9.]+)\s*([a-zA-Z]+)?$/);
    if (!match) return 0;
    const val = parseFloat(match[1]);
    const unit = (match[2] || '').toUpperCase();
    if (unit.startsWith('K')) return val * 1024;
    if (unit.startsWith('M')) return val * 1024 * 1024;
    if (unit.startsWith('G')) return val * 1024 * 1024 * 1024;
    if (unit.startsWith('T')) return val * 1024 * 1024 * 1024 * 1024;
    return val;
  };

  const filteredImages = useMemo(() => {
    return images
      .filter((img) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          (img.Tag && img.Tag.toLowerCase().includes(q)) ||
          (img.ID && img.ID.toLowerCase().includes(q)) ||
          (img.Digest && img.Digest.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        let compare = 0;
        if (sortBy === 'tag') {
          compare = (a.Tag || '').localeCompare(b.Tag || '');
        } else if (sortBy === 'size') {
          compare = parseSizeToBytes(a.Size) - parseSizeToBytes(b.Size);
        } else if (sortBy === 'containers') {
          compare = (a.Containers || 0) - (b.Containers || 0);
        } else if (sortBy === 'created') {
          compare = new Date(a.Created_At || 0).getTime() - new Date(b.Created_At || 0).getTime();
        }
        return sortOrder === 'asc' ? compare : -compare;
      });
  }, [images, searchQuery, sortBy, sortOrder]);

  const handleConfirmSingleRemove = async () => {
    if (!imageToRemove) return;
    try {
      await removeImage({ imageId: imageToRemove.ID });
      setSelectedIds((prev) => prev.filter((id) => id !== imageToRemove.ID));
      setImageToRemove(null);
    } catch {
      // handled in mutation toast
    }
  };

  const handleConfirmBatchRemove = async () => {
    if (selectedIds.length === 0) return;
    try {
      await removeMultipleImages({ imageIds: selectedIds });
      setSelectedIds([]);
      setIsConfirmBatchOpen(false);
    } catch {
      // handled in mutation toast
    }
  };

  const allSelected =
    filteredImages.length > 0 && selectedIds.length === filteredImages.length;

  return (
    <div className="space-y-4">
      {/* Search and Sort Toolbar */}
      <ImageFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        selectedCount={selectedIds.length}
        onDeleteSelected={() => setIsConfirmBatchOpen(true)}
        isDeletingSelected={isRemovingMultiple}
      />

      {/* Images List Content */}
      {filteredImages.length === 0 ? (
        <EmptyState
          icon="image"
          title={searchQuery ? 'No matching images' : 'No images found'}
          description={
            searchQuery
              ? 'No Docker images match your search query.'
              : 'There are currently no Docker images pulled or cached on this host.'
          }
          actionLabel={onRefresh ? 'Refresh Images' : undefined}
          onAction={onRefresh}
          isLoading={isLoading}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800 bg-zinc-950/70">
                  <tr>
                    <th className="py-3 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded bg-zinc-950 border-zinc-700 text-blue-600 focus:ring-blue-500/50 cursor-pointer"
                        aria-label="Select all images"
                      />
                    </th>
                    <th className="py-3 px-4 font-semibold">Repository / Tag</th>
                    <th className="py-3 px-4 font-semibold">Image ID</th>
                    <th className="py-3 px-4 font-semibold">Size</th>
                    <th className="py-3 px-4 font-semibold">Containers</th>
                    <th className="py-3 px-4 font-semibold">Created</th>
                    <th className="py-3 px-4 font-semibold">Digest</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {filteredImages.map((image) => (
                    <ImageTableRow
                      key={image.ID}
                      image={image}
                      isSelected={selectedIds.includes(image.ID)}
                      onToggleSelect={handleToggleSelect}
                      onRemove={(img) => setImageToRemove(img)}
                      isRemoving={isRemovingImage && removingImageId === image.ID}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredImages.map((image) => (
              <ImageCard
                key={image.ID}
                image={image}
                isSelected={selectedIds.includes(image.ID)}
                onToggleSelect={handleToggleSelect}
                onRemove={(img) => setImageToRemove(img)}
                isRemoving={isRemovingImage && removingImageId === image.ID}
              />
            ))}
          </div>
        </>
      )}

      {/* Confirmation Dialog for Single Image Removal */}
      <ConfirmDialog
        isOpen={Boolean(imageToRemove)}
        onClose={() => setImageToRemove(null)}
        onConfirm={handleConfirmSingleRemove}
        title="Remove Docker Image?"
        variant="danger"
        confirmLabel="Remove Image"
        isLoading={isRemovingImage}
        description={
          <div>
            Are you sure you want to remove image{' '}
            <strong className="text-zinc-100 font-mono">
              {imageToRemove?.Tag || imageToRemove?.ID.slice(0, 12)}
            </strong>
            ?
            <div className="mt-3 p-2 rounded bg-zinc-950/80 border border-zinc-800 font-mono text-xs text-zinc-400">
              POST /remove/image
              <br />
              {`{ "imageId": "${imageToRemove?.ID}" }`}
            </div>
          </div>
        }
      />

      {/* Confirmation Dialog for Multiple Images Removal */}
      <ConfirmDialog
        isOpen={isConfirmBatchOpen}
        onClose={() => setIsConfirmBatchOpen(false)}
        onConfirm={handleConfirmBatchRemove}
        title="Remove Multiple Images?"
        variant="danger"
        confirmLabel={`Remove ${selectedIds.length} Images`}
        isLoading={isRemovingMultiple}
        description={
          <div>
            Are you sure you want to permanently remove{' '}
            <strong className="text-zinc-100">{selectedIds.length} selected Docker images</strong>?
            <div className="mt-3 p-2 max-h-36 overflow-y-auto rounded bg-zinc-950/80 border border-zinc-800 font-mono text-xs text-zinc-400 space-y-1">
              {selectedIds.map((id) => (
                <div key={id} className="truncate">
                  • {id}
                </div>
              ))}
            </div>
          </div>
        }
      />
    </div>
  );
};
