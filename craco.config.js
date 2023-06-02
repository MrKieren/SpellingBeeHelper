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
                        "./src/content_scripts/controls/ToggleButton.tsx",

                        "./src/content_scripts/TodaysHintsParser.ts",

                        "./src/content_scripts/Index.tsx",

                        "./src/content_scripts/SpellingBeeHelper.tsx",
                        "./src/content_scripts/FoundWordsParser.ts",
                        "./src/content_scripts/SpellingBeeGrid.tsx",
                        "./src/content_scripts/TwoLetterList.tsx",
                        "./src/content_scripts/WordTotals.tsx",
                        "./src/content_scripts/BeePhoto.tsx",

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
