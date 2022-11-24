import { Context, Next } from 'koa';
import path from 'path';
import fs from 'fs';

const pageUpload = (ctx: Context, next: Next) => {
  ctx.set('Content-Type', 'text/html');

  const filePath = path.resolve('./', 'static', 'upload.html');
  const buffer = fs.readFileSync(filePath);

  ctx.body = buffer;
};

export default pageUpload;
