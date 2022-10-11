import { Context, Next } from 'koa';
import db from '../utils/db.js';
import constant from '../utils/constant.js';

const infoAll = async (ctx: Context, next: Next) => {
  if (ctx.cookies.get('token') !== constant.TOKEN) {
    ctx.status = 401;
    ctx.body = { error: 'need auth' };
    return;
  }

  if (db.data) {
    const { files, original } = db.data;

    ctx.set('Content-Type', 'application/json');
    ctx.body = { files, original };
  }
  return;
};

export default infoAll;
