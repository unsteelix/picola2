import { Context, Next } from 'koa';
import fs from 'fs';
import {
  moveFile,
  checkFile,
  getType,
  getImgMetadata
} from '../utils/index.js';
import path from 'path';
import db from '../utils/db.js';
import { nanoid } from 'nanoid';

const upload = async (ctx: Context, next: Next) => {
  // console.log('fields: ', ctx.request.body);
  // console.log('files: ', ctx.request.files);
  const { files } = ctx.request;

  if (files) {
    // list forms => plain array
    const listFiles: Array<object> = Object.values(files)
      .flat()
      .filter((el) => el.size > 0);

    return (async () => {
      const res: any = [];

      for (const oneFile of listFiles) {
        res.push(await saveFile(oneFile));
      }

      console.log(res);
      ctx.set('Content-Type', 'application/json');
      ctx.body = res;
    })();
  }

  // if (files) {
  //   Object.values(files).forEach((el) => {
  //     if (Array.isArray(el)) {
  //       listFiles = [...listFiles, ...el];
  //     } else if (typeof el === 'object') {
  //       if (el.size > 0) {
  //         listFiles.push(el);
  //       }
  //     }
  //   });
  // }
};

type SaveFileRes = {
  status: 'success' | 'error';
  [key: string]: any;
};

/**
 * move file from temp directory to volume
 * save to db
 */
const saveFile = async (file: any): Promise<SaveFileRes> => {
  const { filepath, originalFilename, mimetype, size } = file;

  try {
    // check size and format
    checkFile(file);

    const id = nanoid(10);
    const ext = path.extname(originalFilename);
    const newName = `${id}${ext}`;
    const type = getType(<any>file);

    let DBrecord: any = {
      type,
      id,
      originalName: originalFilename,
      newName,
      mimetype,
      size,
      ext
    };

    if (type === 'image') {
      const metadata = await getImgMetadata(filepath);
      const { width, height } = metadata;
      DBrecord = { ...DBrecord, width, height };
    }

    await moveFile(filepath, path.join('./', 'volume', newName)); // move temp => volume

    // file is good
    if (db.data) {
      // save to DB
      if (type === 'image') {
        db.data.original = { ...db.data.original, [id]: DBrecord };
      } else if (type === 'file') {
        db.data.files = { ...db.data.files, [id]: DBrecord };
      }
      db.write();
      return { status: 'success', ...DBrecord };
    }

    // file is bad
  } catch (e: any) {
    fs.rm(filepath, () => {
      console.log(`file ${originalFilename} not save on server`);
    });
    return {
      status: 'error',
      originalName: originalFilename,
      text: e.message
    };
  }

  return {
    status: 'error',
    text: 'something wrong'
  };
};

export default upload;
