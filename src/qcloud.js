import { colors, log } from 'gulp-util';
import COS from 'cos-nodejs-sdk-v5';

export default function(option) {
  const cos = new COS({
    Proxy: option.proxy || '',
    SecretId: option.secretId,
    SecretKey: option.secretKey,
  });
  function uploadFile(buffer, key, retry = 3) {
    return new Promise((resolve, reject) => {
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
            log(colors.red('[上传文件错误]'), err);
          }
          if (data && +data.statusCode === 200) {
            const url = `http://${option.bucket}-${option.appId}.cos.${
              option.region
            }.myqcloud.com/${encodeURIComponent(key)}`;
            resolve(url);
          } else if (retry) {
            uploadFile(buffer, key, retry - 1).then(resolve, reject);
          }
        }
      );
    });
  }

  return (files) =>
    Promise.all(files.map(({ data, key }) => uploadFile(data, key)))
      .then((fulfilled) => {
        log(colors.green('[Result]'), fulfilled);
        return fulfilled;
      })
      .catch((err) => {
        log(colors.red(err));
      });
}
