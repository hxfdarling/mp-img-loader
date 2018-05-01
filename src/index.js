/* eslint-disable
  global-require,
  no-param-reassign,
  prefer-destructuring,
  import/no-dynamic-require,
*/
import path from 'path';

import crypto from 'crypto';

import { getOptions } from 'loader-utils';
import validateOptions from 'schema-utils';
import mime from 'mime';

import QCloud from './qcloud';

import schema from './options.json';

function toCloud(resource, buffer, option) {
  const md5 = crypto.createHash('md5');
  const result = md5.update(buffer).digest('hex');
  let baseName = path.basename(resource).split('.');
  baseName.pop();
  baseName = baseName.join('');
  const key = `wxapp-${baseName}-${result}${path.extname(resource)}`;
  const url = `http://${option.bucket}-${option.appId}.cos.${
    option.region
  }.myqcloud.com/${encodeURIComponent(key)}`;
  return { key, url };
}

// Loader Mode
export const raw = true;

export default function loader(src, map, meta) {
  // Loader Options
  const options = Object.assign(
    {
      mode: 'base64',
    },
    getOptions(this)
  );
  const { mode, qcloud } = options;
  let { mimetype } = options;

  validateOptions(schema, options, 'mp image Loader');

  const file = this.resourcePath;
  const resource = this.resource;
  const callback = this.async();

  let code = '';

  // Get MIME type
  mimetype = mimetype || mime.getType(file);

  if (typeof src === 'string') {
    src = Buffer.from(src);
  }
  if (mode === 'base64') {
    code = `module.exports = ${JSON.stringify(
      `data:${mimetype || ''};base64,${src.toString('base64')}`
    )}`;
    callback(null, code, map, meta);
  } else if (mode === 'qcloud') {
    const { key, url } = toCloud(resource, src, qcloud);

    QCloud(qcloud)([{ data: src, key }])
      .then(() => {
        code = `module.exports = "${url}"`;
        callback(null, code, map, meta);
      })
      .catch((e) => {
        callback(e, code, map, meta);
      });
  }
}
