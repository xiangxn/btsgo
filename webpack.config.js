/**
 * Created by xiangxn on 2016/12/10.
 */
var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: path.resolve(__dirname, './app/main.js'),
    output: {
        path: path.resolve(__dirname, './build'),
        filename: 'bundle.js',
    },
    module: {
        loaders: [
            {
                test: /\.js|jsx$/, loaders: ['babel?presets[]=es2015,presets[]=react,presets[]=stage-0']
            },
            {
                test: /\.css$/, loader: 'style!css?modules!postcss'
            },
            {
                test: /\.scss$/, loader: 'style!css!sass?sourceMap'
            },
            {
                test: /\.(png|jpg|jpeg|gif|woff)$/, loader: 'url?limit=8192'
            }]
    },
    plugins: []
};