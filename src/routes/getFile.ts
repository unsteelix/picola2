import { Context, Next } from 'koa';
import fs from 'fs';
import path from 'path';
import db from '../utils/db.js';

const getFile = async (ctx: Context, next: Next) => {
  const { id } = ctx.params;
  const file = db.data?.files[id];
  const { newName, mimetype } = file;

  const filePath = path.resolve('./', 'volume', newName);
  const buffer = fs.readFileSync(filePath);

  ctx.set('Content-Type', `${mimetype}; charset=utf-8`);
  ctx.body = buffer;
};

export default getFile;
