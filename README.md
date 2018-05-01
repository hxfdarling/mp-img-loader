<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://cdn.rawgit.com/webpack/media/e7485eb2/logo/icon.svg">
  </a>
  <h1>min programe image Loader</h1>
  <p>Loads files as `base64` encoded URL or upload to cloud</p>
</div>

<h2 align="center">Install</h2>

```bash
npm install --save-dev mp-imageloader
```

<h2 align="center"><a href="https://webpack.js.org/concepts/loaders">Usage</a></h2>

The `mp-imageloader` works like the [`file-loader`](https://github.com/webpack-contrib/file-loader), but can return a DataURL if the file is smaller than a byte limit.

```js
import img from './image.png';
```

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'mp-imageloader',
            options: {},
          },
        ],
      },
    ],
  },
};
```

<h2 align="center">Options</h2>

|            Name             |    Type    |    Default    | Description                                                                      |
| :-------------------------: | :--------: | :-----------: | :------------------------------------------------------------------------------- |
| **[`mimetype`](#mimetype)** | `{String}` |   `extname`   | Specify MIME type for the file (Otherwise it's inferred from the file extension) |
| **[`fallback`](#fallback)** | `{String}` | `file-loader` | Specify `loader` for the file when file is greater than the limit (in bytes)     |

### `mimetype`

Set the MIME type for the file. If unspecified the file extensions will be used to lookup the MIME type.

**webpack.config.js**

```js
{
  loader: 'mp-imageloader',
  options: {
    mimetype: 'image/png'
  }
}
```

### `fallback`

**webpack.config.js**

```js
{
  loader: 'mp-imageloader',
  options: {
    fallback: 'responsive-loader'
  }
}
```
