/* eslint-disable
  prefer-destructuring,
*/
import webpack from '@webpack-contrib/test-utils';

describe('Loader', () => {
  test('file-loader', async () => {
    const config = {
      loader: {
        test: /\.(png|jpg|gif)$/,
        options: {},
      },
    };

    const stats = await webpack('file.js', config);
    const { source } = stats.toJson().modules[0];
    expect(source).toMatchSnapshot();
  });
});
