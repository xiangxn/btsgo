/**
 * Created by xiangxn on 2016/12/11.
 */
var path = require('path');
var webpack = require('webpack');

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
            {test: /\.scss$/, loader: 'style!css!sass?sourceMap'},
            {
                test: /\.css$/,
                loader: 'style!css?modules!postcss'
            },
            {
                test: /\.(png|jpg|jpeg|gif|woff)$/,
                loader: 'url?limit=8192'
            }]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
};