export interface DockerImage {
  Containers: number;
  Created_At: string;
  Created_Since: string;
  Digest: string;
  ID: string;
  Shared_Size: string;
  Size: string;
  Tag: string;
  UniqueSize: string;
}

export interface RemoveImagePayload {
  imageId: string;
}

export interface RemoveImagesPayload {
  imageIds: string[];
}

export interface RemoveImageResponse {
  message: string;
  imageId: string;
  output: string;
}

export interface RemoveImagesResponse {
  message: string;
  imageIds: string[];
  output: string;
}
