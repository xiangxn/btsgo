/**
 * Created by xiangxn on 2016/12/10.
 */
let path = require('path');
let webpack = require('webpack');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
var git = require("git-rev-sync");
var argv = require('yargs').argv;

var root_dir = path.resolve(__dirname);

module.exports = {
    entry: path.resolve(root_dir, './app/main.js'),
    output: {
        path: path.resolve(root_dir, 'build/assets'),
        filename: 'bundle.js',
        publicPath:'/assets/'
    },
    module: {
        loaders: [
            {
                test: /\.js|jsx$/,
                exclude: [/node_modules/],
                loaders: ['babel?presets[]=es2015,presets[]=react,presets[]=stage-0']
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('style', 'css!postcss!sass')
                //loader: 'css!sass?sourceMap'
            },
            {
                test: /\.(png|jpg|jpeg|gif|woff|otf)$/, loader: 'url?limit=8192'
            },
            {
                test: /\.json$/, loader: 'json',
                exclude: [
                    path.resolve(root_dir, "common")
                ]
            }]
    },
    postcss: [
        require('autoprefixer')
    ],
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            },
            APP_VERSION: JSON.stringify(git.tag()),
            __BASE_URL__: JSON.stringify((argv.env && argv.env.baseUrl) || "")
        }),
        new webpack.optimize.UglifyJsPlugin(),
        new ExtractTextPlugin('style.css', {allChunks: true})
    ]
};