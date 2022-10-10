import fs from 'fs';
import path from 'path';
import constant from './constant.js';
import sizeOf from 'image-size/dist/index.js';
import sharp from 'sharp';

interface File {
  filepath: string;
  originalFilename: string;
  mimetype: string;
  size: number;
}

export const getImgMetadata = async (filepath: string) => {
  return await sharp(filepath).metadata();
};

/**
 * get width, height of image
 */
// export const getImgDimensions = async (
//   path: string
// ): Promise<{ width: number; height: number }> => {
//   try {
//     const dimensions = sizeOf(path);
//     const { width, height } = dimensions;

//     if (!width || !height) {
//       throw new Error('could not determine the image dimensions');
//     }

//     return {
//       width,
//       height
//     };
//   } catch (err: any) {
//     throw new Error(err.message);
//   }
// };

export const moveFile = async (oldPath: string, newPath: string) => {
  // 1. Create the destination directory
  // Set the `recursive` option to `true` to create all the subdirectories
  await fs.promises.mkdir(path.dirname(newPath), { recursive: true });
  try {
    // 2. Rename the file (move it to the new directory)
    await fs.promises.rename(oldPath, newPath);
  } catch (error: any) {
    if (error.code === 'EXDEV') {
      // 3. Copy the file as a fallback
      await fs.promises.copyFile(oldPath, newPath);
      // Remove the old file
      await fs.promises.unlink(oldPath);
    } else {
      // Throw any other error
      throw error;
    }
  }
};

export const checkFile = (file: File) => {
  const { filepath, originalFilename, mimetype, size } = file;
  const sizeMB = size / 1000 / 1000;
  const maxFileSizeMB = constant.maxFileSize / 1000 / 1000;
  const maxImgSizeMB = constant.maxImgSize / 1000 / 1000;
  const type = getType(file);

  if (type === 'image') {
    // if (!constant.availableImgMimeTypes.includes(mimetype)) {
    //   throw new Error(
    //     `mimetype ${mimetype} unavailable, try: ${constant.availableImgMimeTypes.concat(
    //       ', '
    //     )}`
    //   );
    // }

    if (size > constant.maxImgSize)
      throw new Error(
        `${sizeMB}MB is too big, max image size is ${maxImgSizeMB}MB`
      );
  } else if (type === 'file') {
    if (size > constant.maxFileSize)
      throw new Error(
        `${sizeMB}MB is too big, max file size is ${maxFileSizeMB}MB`
      );
  }
};

/**
 * return "file" or "image"
 */
export const getType = (file: File): 'image' | 'file' => {
  if (constant.availableImgMimeTypes.includes(file.mimetype)) {
    return 'image';
  }
  return 'file';
};
