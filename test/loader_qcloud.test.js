/* eslint-disable
  prefer-destructuring,
*/
import webpack from '@webpack-contrib/test-utils';

describe('Loader', () => {
  test('Defaults', async () => {
    const config = {
      loader: {
        test: /\.png$/,
        options: {
          mode: 'qcloud',
          qcloud: {},
        },
      },
    };

    const stats = await webpack('qcloud.js', config);
    const { source } = stats.toJson().modules[0];

    expect(source).toMatchSnapshot();
  });
});
