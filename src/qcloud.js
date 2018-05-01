import path from 'path';
import crypto from 'crypto';

import { colors, log } from 'gulp-util';
import COS from 'cos-nodejs-sdk-v5';

function getKey({ filePath, buffer }) {
  const md5 = crypto.createHash('md5');
  const result = md5.update(buffer).digest('hex');
  let baseName = path.basename(filePath).split('.');
  baseName.pop();
  baseName = baseName.join('');
  return `min-programe-${baseName}-${result}${path.extname(filePath)}`;
}

export default class Qcloud {
  constructor(option) {
    this.option = option;
    this.cache = {};
    this.cos = new COS({
      Proxy: option.proxy || '',
      SecretId: option.secretId,
      SecretKey: option.secretKey,
    });
  }

  uploadFiles(files) {
    return Promise.all(files.map((file) => this.uploadFile(file)));
  }
  uploadFile(file) {
    return this._upload(file.buffer, getKey(file)).then((fulfilled) => {
      log(colors.green('[upload image url]'), fulfilled);
      return fulfilled;
    });
  }
  _upload(buffer, key, retry = 3) {
    const { option, cos } = this;
    return new Promise((resolve, reject) => {
      if (this.cache[key]) {
        resolve(this.cache[key]);
      } else {
        cos.putObject(
          {
            Bucket: `${option.bucket}-${option.appId}`,
            Region: option.region,
            Key: key,
            ContentLength: buffer.length,
            Body: buffer,
            ACL: 'public-read',
            onProgress(progressData) {
              log(
                colors.green('[upload progress]'),
                JSON.stringify(progressData)
              );
            },
          },
          (err, data) => {
            if (err) {
              log(colors.red(`[上传文件错误]:retry:${3 - retry}`), err);
            } else if (data && +data.statusCode === 200) {
              const url = `http://${option.bucket}-${option.appId}.cos.${
                option.region
              }.myqcloud.com/${encodeURIComponent(key)}`;
              this.cache[key] = url;
              resolve(url);
            } else if (retry) {
              this._upload(buffer, key, retry - 1).then(resolve, reject);
            } else {
              reject(err);
            }
          }
        );
      }
    });
  }
}
