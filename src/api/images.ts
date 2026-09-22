import { apiClient } from './client';
import {
  DockerImage,
  RemoveImagePayload,
  RemoveImageResponse,
  RemoveImagesPayload,
  RemoveImagesResponse,
} from '../types/image';

export async function fetchImages(): Promise<DockerImage[]> {
  const response = await apiClient.get<DockerImage[]>('/get/all/images');
  return Array.isArray(response.data) ? response.data : [];
}

export async function removeImage(payload: RemoveImagePayload): Promise<RemoveImageResponse> {
  const response = await apiClient.post<RemoveImageResponse>('/remove/image', payload);
  return response.data;
}

export async function removeMultipleImages(payload: RemoveImagesPayload): Promise<RemoveImagesResponse> {
  const response = await apiClient.post<RemoveImagesResponse>('/remove/images', payload);
  return response.data;
}
