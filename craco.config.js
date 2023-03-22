const path = require('path');

module.exports = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            return {
                ...webpackConfig,
                entry: {
                    main: [env === "development" &&
                        require.resolve("react-dev-utils/webpackHotDevClient"), paths.appIndexJs].filter(Boolean),
                    content: [
                        "./src/content_scripts/utils.ts",

                        "./src/content_scripts/spellingbee.tsx",
                        "./src/content_scripts/spellingbeegrid.tsx"
                    ]
                },
                output: {
                    ...webpackConfig.output,
                    path: path.resolve(__dirname, 'build'),
                    filename: 'static/js/[name].js',
                },
                optimization: {
                    ...webpackConfig.optimization,
                    runtimeChunk: false,
                    minimize: false
                }
            }
        },
    }
}
