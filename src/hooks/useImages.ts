import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchImages, removeImage, removeMultipleImages } from '../api/images';
import {
  DockerImage,
  RemoveImagePayload,
  RemoveImagesPayload,
} from '../types/image';
import { parseApiErrorMessage } from '../api/client';
import { useConfig } from '../context/ConfigContext';

export const IMAGES_QUERY_KEY = ['images'] as const;

export function useImages() {
  return useQuery<DockerImage[], Error>({
    queryKey: IMAGES_QUERY_KEY,
    queryFn: async () => {
      return await fetchImages();
    },
    refetchInterval: 15000,
    retry: 2,
  });
}

export function useImageMutations() {
  const queryClient = useQueryClient();
  const { addToast } = useConfig();

  const removeSingleMutation = useMutation({
    mutationFn: (payload: RemoveImagePayload) => removeImage(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: IMAGES_QUERY_KEY });
      addToast(
        'success',
        'Image Removed',
        data.message || `Image ${variables.imageId} removed successfully.`
      );
    },
    onError: (err: unknown) => {
      const msg = parseApiErrorMessage(err);
      addToast('error', 'Failed to Remove Image', msg);
    },
  });

  const removeMultipleMutation = useMutation({
    mutationFn: (payload: RemoveImagesPayload) => removeMultipleImages(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: IMAGES_QUERY_KEY });
      addToast(
        'success',
        'Images Removed',
        data.message || `Removed ${variables.imageIds.length} images successfully.`
      );
    },
    onError: (err: unknown) => {
      const msg = parseApiErrorMessage(err);
      addToast('error', 'Failed to Remove Images', msg);
    },
  });

  return {
    removeImage: removeSingleMutation.mutateAsync,
    isRemovingImage: removeSingleMutation.isPending,
    removingImageId: removeSingleMutation.variables?.imageId,

    removeMultipleImages: removeMultipleMutation.mutateAsync,
    isRemovingMultiple: removeMultipleMutation.isPending,
    removingImageIds: removeMultipleMutation.variables?.imageIds,
  };
}
