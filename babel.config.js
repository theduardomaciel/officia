module.exports = function (api) {
	api.cache(true);
	return {
		presets: ["babel-preset-expo"],
		plugins: [
			["nativewind/babel"],
			["module:react-native-dotenv"],
			[
				"module-resolver",
				{
					root: ["./src"],
					extensions: [
						".ios.js",
						".android.js",
						".js",
						".ts",
						".tsx",
						".json",
					],
					alias: {
						src: "./src",
					},
				},
			],
			["@babel/plugin-proposal-decorators", { legacy: true }],
			["react-native-reanimated/plugin"],
		],
	};
};
