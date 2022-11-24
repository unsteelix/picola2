import Koa, { Context, DefaultState } from 'koa';
import Router from '@koa/router';
import routes from './routes/index.js';
import KoaBody from 'koa-body';
import serve from 'koa-static';
import logger from './middlewares/logger.js';
import responseTimer from './middlewares/responseTimer.js';
import constant from './utils/constant.js';
import path from 'path';

const app = new Koa();
const router = new Router<DefaultState, Context>();
const koaBody = KoaBody({
  multipart: true,
  formLimit: 1000 * 1000 * 100
});

// middlewares
app.use(logger);
app.use(responseTimer);
app.use(serve(path.resolve('./static')));
app.use(async (ctx, next) => {
  console.log('Setting status', ctx.path);

  if (ctx.path === '/preview') {
    const userToken = ctx.cookies.get('token');
    console.log('userToken: ' + userToken);
    if (constant.TOKEN !== userToken) {
      console.log('need auth');
      ctx.body = 'need auth';
    }
  }
  await next();
});

// router
router
  .get('/', routes.pageUpload)
  .get('/preview', routes.pagePreview)
  .post('/upload', koaBody, routes.upload)
  .get('/i/:id', routes.getImage)
  .get('/f/:id', routes.getFile)
  .get('/auth/:pass', routes.auth)
  .get('/info/all', routes.infoAll)
  .get('/info/:id', routes.info);

app.use(router.routes());

app.listen(constant.PORT, () =>
  console.log(`Picola listening on port ${constant.PORT}`)
);
