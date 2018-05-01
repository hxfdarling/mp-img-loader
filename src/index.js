/* eslint-disable
  global-require,
  no-param-reassign,
  import/no-dynamic-require,
*/
import { getOptions } from 'loader-utils';
import validateOptions from 'schema-utils';
import mime from 'mime';

import QCloud from './qcloud';

import schema from './options.json';

// Loader Mode
export const raw = true;

export default function loader(buffer, map, meta) {
  // Loader Options
  const options = Object.assign(
    {
      mode: 'base64',
    },
    getOptions(this)
  );
  const { mode, qcloud, upload, fallback } = options;
  let { mimetype } = options;

  validateOptions(schema, options, 'mp image Loader');

  const filePath = this.resourcePath;
  const local = /(\?|&)local/.test(this.resource);

  let code = '';

  // Get MIME type
  mimetype = mimetype || mime.getType(filePath);

  if (typeof buffer === 'string') {
    buffer = Buffer.from(buffer);
  }
  if (local) {
    return require(fallback || 'file-loader').call(this, buffer);
  }
  const callback = this.async();

  if (mode === 'base64') {
    code = `module.exports = ${JSON.stringify(
      `data:${mimetype || ''};base64,${buffer.toString('base64')}`
    )}`;
    callback(null, code, map, meta);
  } else if (mode === 'qcloud') {
    if (qcloud) {
      new QCloud(qcloud)
        .uploadFile({
          buffer,
          filePath,
        })
        .then((url) => {
          code = `module.exports = "${url}"`;
          callback(null, code, map, meta);
        })
        .catch((e) => {
          callback(e, code, map, meta);
        });
    } else if (upload) {
      upload({ buffer, filePath, local });
    } else {
      throw new Error('qcloud mode need qcloud option or upload function');
    }
  }
  return null;
}
