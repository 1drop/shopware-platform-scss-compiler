const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const fs = require("fs");
const chalk = require("chalk");
const projectRootPath = process.env.PROJECT_ROOT
    ? path.resolve(process.env.PROJECT_ROOT)
    : path.resolve('../../../../../../..');
let features = {};
const featureConfigPath = path.resolve(projectRootPath, 'var/config_js_features.json');

if (fs.existsSync(featureConfigPath)) {
    features = require(featureConfigPath);
} else {
    console.error(chalk.red('\n \u{26A0}️  The feature dump file "config_js_features.json" cannot be found. All features will be deactivated. Please execute bin/console feature:dump.  \u{26A0}️\n'));
}

function resolvePath(dir = null) {
    let resolvedPath = path.resolve(__dirname, '..', '..', '..', '..', '..', '..', 'vendor', 'shopware', 'storefront', 'Resources', 'app', 'storefront');
    if (dir) {
        resolvedPath = path.resolve(__dirname, '..', '..', '..', '..', '..', '..', 'vendor', 'shopware', 'storefront', 'Resources', 'app', 'storefront', dir);
    }

    return resolvedPath;
}

const config = {
    mode: 'production',
    devtool: 'none',
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'postcss-loader', 'sass-loader']
                })
            },
        ]
    },
    plugins: [
        new ExtractTextPlugin("styles.css")
    ],
    entry: {
        storefront: [path.join(__dirname, '/tmp/style.scss')]
    },
    resolve: {
        extensions: ['.less', '.sass', '.scss'],
        modules: [
            // statically add the storefront node_modules folder, so sw plugins can resolve it
            resolvePath('node_modules')
        ],
        alias: {
            '~': resolvePath(),
            src: resolvePath('src'),
            assets: resolvePath('dist/assets'),
            jquery: 'jquery/dist/jquery.slim',
            scss: resolvePath('src/scss'),
            vendor: resolvePath('vendor'),
            vendorBootstrap: features['v6.5.0.0']
                ? resolvePath('vendor/bootstrap5')
                : resolvePath('vendor/bootstrap')
        },
    }
};

module.exports = config;
