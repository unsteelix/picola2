import { Context, Next } from 'koa';
import constant from '../utils/constant.js';

const auth = async (ctx: Context, next: Next) => {
  const { pass } = ctx.params;

  ctx.set('Content-Type', 'application/json');

  if (pass === constant.PASS) {
    ctx.status = 200;
    ctx.cookies.set('token', constant.TOKEN)
    ctx.body = { token: constant.TOKEN };
  } else {
    ctx.status = 401;
    ctx.body = { error: 'bad password' };
  }

  return;
};

export default auth;
