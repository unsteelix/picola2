import { Context, Next } from 'koa';
import db from '../utils/db.js';

const info = async (ctx: Context, next: Next) => {
  const { id } = ctx.params;

  if (db.data) {
    const { files, original } = db.data;

    const file = original[id] || files[id];
    if (file) {
      ctx.status = 200;
      ctx.set('Content-Type', 'application/json');
      ctx.body = file;
    } else {
      ctx.status = 404;
      ctx.set('Content-Type', 'application/json');
      ctx.body = 'file no found';
    }
  }
  return;
};

export default info;
