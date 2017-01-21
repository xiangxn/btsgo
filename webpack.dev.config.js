/**
 * Created by xiangxn on 2016/12/11.
 */
let path = require('path');
let webpack = require('webpack');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: ['webpack/hot/dev-server', path.resolve(__dirname, './app/main.js')],
    output: {
        path: path.resolve(__dirname, './build'),
        filename: 'bundle.js',
    },
    devServer: {
        port: 8080,
        hot: true
    },
    module: {
        loaders: [
            {
                test: /\.js|jsx$/,
                loaders: ['babel?presets[]=es2015,presets[]=react,presets[]=stage-0']
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('style', 'css!sass')
                //loader: 'css!sass?sourceMap'
            },
            /*{
             test: /\.css$/,
             //loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
             loader: 'css?sourceMap'
             },*/
            {
                test: /\.(png|jpg|jpeg|gif|woff)$/,
                loader: 'url?limit=8192'
            },
            {test: /\.json$/, loader: 'json'}]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new ExtractTextPlugin('build/style.css', {allChunks: true})
    ],
    node: {
        fs: "empty"
    }
};