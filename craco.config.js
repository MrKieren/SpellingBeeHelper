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

                        "./src/content_scripts/controls/ToggleButton.tsx",

                        "./src/content_scripts/todayshintsparser.ts",

                        "./src/content_scripts/index.tsx",

                        "./src/content_scripts/spellingbeehelper.tsx",
                        "./src/content_scripts/foundwordsparser.ts",
                        "./src/content_scripts/spellingbeegrid.tsx",
                        "./src/content_scripts/twoletterlist.tsx",
                        "./src/content_scripts/wordtotals.tsx",
                        "./src/content_scripts/beephoto.tsx",

                        "./src/content_scripts/ErrorView.tsx",

                        "./src/content_scripts/Settings.tsx"
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
