import { Context, Next } from 'koa';

const site = (ctx: Context, next: Next) => {
  ctx.set('Content-Type', 'text/html');
  ctx.body = `
<!doctype html>
<html>
  <body>
    <form action="/upload" enctype="multipart/form-data" method="post">
    <input type="file" name="uploads_1" multiple="multiple"><br>
    <input type="file" name="uploads_2" multiple="multiple"><br>
    <button type="submit">Upload</button>
  </body>
</html>`;
};

export default site;
