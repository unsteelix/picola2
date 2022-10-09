import dotenv from 'dotenv';

dotenv.config();

export const sharpFormats = [
  'jpeg',
  'png',
  'webp',
  'gif',
  'jp2',
  'tiff',
  'avif',
  'heif',
  'raw'
];

export const availableImgMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/jp2',
  'image/tiff',
  'image/avif',
  'image/heif',
  'image/arw'
];
export const maxFileSize = process.env.maxFileSize
  ? parseInt(process.env.maxFileSize)
  : 20 * 1000 * 1000 * 1000; // Byte (20GB)
export const maxImgSize = process.env.maxFileSize
  ? parseInt(process.env.maxFileSize)
  : 200 * 1000 * 1000; // Byte (200MB)

export const port = process.env.PORT ? parseInt(process.env.PORT) : 2000;

export default {
  availableImgMimeTypes,
  maxFileSize,
  maxImgSize
};
