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

  let listFiles: Array<object> = [];

  // list forms => plain array
  if (files) {
    Object.values(files).forEach((el) => {
      if (Array.isArray(el)) {
        listFiles = [...listFiles, ...el];
      } else if (typeof el === 'object') {
        if (el.size > 0) {
          listFiles.push(el);
        }
      }
    });
  }

  const res: any = [];

  return (async () => {
    for (const oneFile of listFiles) {
      const { filepath, originalFilename, mimetype, size } = <any>oneFile;

      try {
        // check size and format
        checkFile(<any>oneFile);

        const id = nanoid(10);
        const ext = path.extname(originalFilename);
        const newName = `${id}${ext}`;
        const type = getType(<any>oneFile);

        const metadata = await getImgMetadata(filepath);
        const { width, height } = metadata;

        const file = {
          type,
          id,
          originalName: originalFilename,
          newName,
          mimetype,
          size,
          ext,
          width,
          height
        };

        // file is good
        if (db.data) {
          db.data.original = { ...db.data.original, [id]: file }; // save to DB
          db.write();
          await moveFile(filepath, path.join('./', 'volume', newName)); // move temp => volume
          res.push({ status: 'success', ...file }); // response array
          console.log(file);
        }
        // file is bad
      } catch (e: any) {
        fs.rm(filepath, () => {
          console.log(`file ${originalFilename} with error not save on server`);
        });
        res.push({
          status: 'error',
          originalName: originalFilename,
          text: e.message
        });
      }
    }
    console.log(res);
    ctx.set('Content-Type', 'application/json');
    ctx.body = res;
  })();
};

export default upload;
