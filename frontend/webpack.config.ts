import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import 'webpack-dev-server';

export default (env: {
	watch: string;
	mode: 'production' | 'development';
	protocol: string;
	adress: string;
	whereToBuild?: string;
	buildLocalFolder?: string;
}) => {
	const mode = env.mode || 'development';
	const isDev = mode === 'development';
	const PORT = 3000;
	const isWatch = env.watch === 'true' || false;
	const adress = env.adress || 'localhost:8080';
	const protocol = env.protocol || 'http';
	const whereToBuild = env.whereToBuild || "build"
	const buildLocalFolder = env.buildLocalFolder === 'true' || false

	const config: webpack.Configuration = {
		mode: 'development',
		entry: './src/index.tsx',
		output: {
			filename: '[name][contenthash].js',
			path: buildLocalFolder ? path.resolve(__dirname, whereToBuild) : whereToBuild,
			clean: true,
			publicPath: '/'
		},
		module: {
			rules: [
				{
					test: /\.(s(a|c)ss)$/,
					include: path.resolve(__dirname, 'src'),
					use: ['style-loader', 'css-loader', 'sass-loader'],
				},
				{
					test: /\.css$/i,
					use: ['style-loader', 'css-loader'],
				},
				{
					test: /\.tsx?$/,
					use: 'ts-loader',
					include: path.resolve(__dirname, 'src'),
					exclude: /node_modules/,
				},
				{
					test: /\.(png|svg|jpg|jpeg|gif|pdf)$/i,
					type: 'asset/resource',
				},
			],
		},
		plugins: [
			new HtmlWebpackPlugin({
				title: 'Development',
				template: './public/index.html',
			}),
			new webpack.DefinePlugin({
				'process.env.adress': JSON.stringify(adress),
				'process.env.protocol': JSON.stringify(protocol)
			})
		],
		devtool: 'inline-source-map',
		watch: isWatch,
		watchOptions: {
			ignored: /node_modules/,
			poll: 20,
		},
		resolve: {
			extensions: ['.js', '.ts', '.tsx'],
			plugins: [
				new TsconfigPathsPlugin({
				}),
			],
		},
		optimization: {
			runtimeChunk: 'single',
		},
	};

	return config;
};
