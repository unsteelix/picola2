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
import hash from 'object-hash';
import sharp from 'sharp';

const getImage = async (ctx: Context, next: Next) => {
  const { query } = ctx.request;
  const { id } = ctx.params;
  const image = db.data?.original[id];

  // original
  if (isOriginal(ctx, id)) {
    console.log('!!! original');

    const { newName, mimetype } = image;

    const filePath = path.resolve('./', 'volume', newName);
    const buffer = fs.readFileSync(filePath);

    ctx.set('Content-Type', mimetype);
    ctx.body = buffer;
    return;
  } else {
    // NOT original
    console.log('!!! not original');

    /**
     * data from base image params (from DB)
     */
    const initData = {
      f: image.ext.split('.')[1],
      w: image.width,
      h: image.height
    };

    const parsedQuery = parseQuery(query);
    const listParsedParams = Object.entries(parsedQuery);

    const {
      f,
      w,
      h,
      q,
      fit,
      position,
      interpolation,
      angle,
      flip,
      flop,
      blur,
      sharpen
    } = parsedQuery;

    /**
     * data from user query
     */
    const userData: any = {
      // //// TODO !!!!!!!!!!!!!!!!!!!!!!!!!
      // f: f ? f : undefined,
      // w: w ? w : undefined,
      // h: h ? h : undefined,
      // q: q ? q : undefined,
      // fit: fit ? fit : undefined,
      // position: position ? position : undefined,
      // interpolation: interpolation ? interpolation : undefined,
      // flip: flip ? flip : undefined,
      // flop: flop ? flop : undefined,
      // blur: blur ? blur : undefined,
      // sharpen: sharpen ? sharpen : undefined
    };

    listParsedParams.forEach((el) => {
      if (el[1]) {
        userData[el[0]] = el[1];
      }
    });

    const hashObj = {
      ...initData,
      ...userData
    };
    //console.log('hashObj', hash(hashObj), 'other', hash({ f: 'webp' }));
    console.log('hashObj', hashObj);

    const cacheId =
      id + '_' + hash(hashObj) + '_w' + hashObj.w + '_h' + hashObj.h;
    console.log('cacheId: ' + cacheId);

    const cachedImage = db.data?.cache[cacheId];

    // cache exists
    if (cachedImage) {
      console.log('!!! YES cache', cachedImage);
      const { newName, mimetype } = cachedImage;

      const filePath = path.resolve('./', 'volume', newName);
      const buffer = fs.readFileSync(filePath);

      ctx.set('Content-Type', mimetype);
      ctx.body = buffer;
      return;
    } else {
      // NO cache
      console.log('!!! NO cache');
      const filePath = path.resolve('./', 'volume', image.newName);

      console.log('----------- BEFORE -------------');
      try {
        let newImage = sharp(filePath);

        if (f) {
          if (q) {
            newImage = newImage.toFormat(f, {
              quality: q
            });
          } else {
            newImage = newImage.toFormat(f);
          }
        }

        if (angle) {
          newImage = newImage.rotate(angle);
        }

        if (flip) {
          newImage = newImage.flip();
        }

        if (flop) {
          newImage = newImage.flop();
        }

        if (w || h) {
          newImage = newImage.resize({
            width: w || undefined,
            height: h || undefined,
            fit,
            position,
            kernel: interpolation
          });
        }

        if (blur) {
          newImage = newImage.blur(blur);
        }
        if (sharpen) {
          newImage = newImage.sharpen({ sigma: sharpen });
        }

        // generate new image
        const generatedImage = await newImage
          .toBuffer({ resolveWithObject: true })
          .then((data) => data)
          .catch((err) => {
            console.log(err.message);
            ctx.status = 400;
            ctx.body = { error: err.message };
          });

        if (generatedImage) {
          const { data, info } = generatedImage;
          const generatedImagePath = path.resolve(
            './',
            'volume',
            `${cacheId}.${info.format}`
          );

          // save to file system
          fs.writeFile(generatedImagePath, data, (err) => {
            if (err) {
              console.log(err.message);
              throw err;
            }
            console.log('generated file has been saved!');
          });
          // save to DB
          if (db.data) {
            db.data.cache = {
              ...db.data.cache,
              [cacheId]: {
                id: cacheId,
                originalId: image.id,
                newName: `${cacheId}.${info.format}`,
                mimetype: `image/${info.format}`,
                size: info.size,
                ext: `.${info.format}`,
                width: info.width,
                height: info.height
              }
            };

            db.write();
          }

          console.log('$$$$$$$$$$$$', info);
          ctx.set('Content-Type', 'image/' + f);
          ctx.body = data;
        }

        return;
      } catch (e) {
        console.log('ERROR----', e);
      }
    }
  }
};

const isOriginal = (ctx: Context, id: string) => {
  const { query } = ctx.request;

  if (Object.keys(query).length === 0) {
    return true;
  }

  if (haveExtraParams(query)) {
    return false;
  }

  const image = db.data?.original[id];
  console.log(query);

  if (image) {
    const { f, w, h, q } = parseQuery(query);

    // format, dimensions and quality the same
    console.log(
      sameFormat(image, f),
      sameDimensions(image, w, h),
      sameQuality(q)
    );

    if (sameFormat(image, f) && sameDimensions(image, w, h) && sameQuality(q)) {
      return true;
    }
  }

  return false;
};

// return true, if get param equal image format
const sameFormat = (image: any, format: string) => {
  if (!format) {
    return true;
  }
  const ext = image.ext.split('.')[1];

  if (ext === format || (format === 'jpeg' && ext === 'jpg')) {
    return true;
  }
  return false;
};

const parseQuery = (query: any) => {
  let f = query.f || null;
  let w = query.w ? parseInt(query.w) : null;
  let h = query.h ? parseInt(query.h) : null;
  let q = query.q ? parseInt(query.q) : null;
  let fit = query.fit || null;
  let position = query.position || null;
  let interpolation = query.interpolation || null;
  let angle = query.angle ? parseInt(query.angle) : null;
  let flip = query.flip || null;
  let flop = query.flop || null;
  let blur = query.blur ? parseInt(query.blur) : null;
  let sharpen = query.sharp ? parseInt(query.sharp) : null;

  if (Array.isArray(f)) {
    f = f[0];
  }
  if (Array.isArray(w)) {
    w = w[0];
  }
  if (Array.isArray(h)) {
    h = h[0];
  }
  if (Array.isArray(q)) {
    q = q[0];
  }
  if (Array.isArray(fit)) {
    fit = fit[0];
  }
  if (Array.isArray(position)) {
    position = position[0];
  }
  if (Array.isArray(interpolation)) {
    interpolation = interpolation[0];
  }
  if (Array.isArray(angle)) {
    angle = angle[0];
  }
  if (Array.isArray(flip)) {
    flip = flip[0];
  }
  if (Array.isArray(flop)) {
    flop = flop[0];
  }
  if (Array.isArray(blur)) {
    blur = blur[0];
  }
  if (Array.isArray(sharpen)) {
    sharpen = sharpen[0];
  }

  return {
    f,
    w,
    h,
    q,
    fit,
    position,
    interpolation,
    angle,
    flip,
    flop,
    blur,
    sharpen
  };
};

const sameDimensions = (image: any, w: any, h: any) => {
  if (!w && !h) {
    return true;
  }

  if (w && h && w === image.width && h === image.height) {
    return true;
  }

  if (w && !h && image.width === w) {
    return true;
  }

  if (!w && h && image.height === h) {
    return true;
  }

  return false;
};

const sameQuality = (q: any) => {
  if (!q || q === 100) {
    return true;
  }
  return false;
};

const haveExtraParams = (query: any) => {
  const listMainParams = ['f', 'w', 'h', 'q'];

  let have = false;

  Object.keys(query).forEach((el) => {
    if (!listMainParams.includes(el)) {
      have = true;
    }
  });

  return have;
};

export default getImage;
