/**
 * Created by xiangxn on 2016/12/10.
 */
let path = require('path');
let webpack = require('webpack');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

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
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('style', 'css!sass')
                //loader: 'css!sass?sourceMap'
            },
            {
                test: /\.(png|jpg|jpeg|gif|woff|otf)$/, loader: 'url?limit=8192'
            },
            {test: /\.json$/,loader: 'json'}]
    },
    plugins: [
        new ExtractTextPlugin('style.css', {allChunks: true})
    ]
};