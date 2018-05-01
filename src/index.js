/* eslint-disable
  global-require,
  no-param-reassign,
  prefer-destructuring,
  import/no-dynamic-require,
*/
import { getOptions } from 'loader-utils';
import validateOptions from 'schema-utils';
import mime from 'mime';

import schema from './options.json';

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
  validateOptions(schema, options, 'mp image Loader');

  const file = this.resourcePath;
  const resource = this.resource;
  const callback = this.async();

  let code = '';

  // Get MIME type
  const mimetype = options.mimetype || mime.getType(file);

  if (typeof src === 'string') {
    src = Buffer.from(src);
  }
  if (options.mode === 'base64') {
    code = `module.exports = ${JSON.stringify(
      `data:${mimetype || ''};base64,${src.toString('base64')}`
    )}`;
  }

  callback(null, code, map, meta);
}
