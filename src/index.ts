import Koa, { Context, DefaultState } from 'koa';
import Router from '@koa/router';
import routes from './routes/index.js';
import KoaBody from 'koa-body';
import logger from './middlewares/logger.js';
import responseTimer from './middlewares/responseTimer.js';
import constant from './utils/constant.js';

const app = new Koa();
const router = new Router<DefaultState, Context>();
const koaBody = KoaBody({
  multipart: true,
  formLimit: 10
});

// middlewares
app.use(logger);
app.use(responseTimer);

// router
router
  .get('/', routes.site)
  .post('/upload', koaBody, routes.upload)
  .get('/i/:id', routes.getImage)
  .get('/f/:id', routes.getFile)
  .get('/auth/:pass', routes.auth)
  .get('/info/all', routes.infoAll)
  .get('/info/:id', routes.info);

app.use(router.routes());

app.listen(constant.PORT);

//  *   /              main page
//  *   /upload        files uploading
//  *   /i/:img_id      get image by id
//  *   /f/:file_id     get file by id
//  *   /auth           auth method, return token by pass
//  *   /info/all       return json db
//  *   /info/:id       return file metadata
