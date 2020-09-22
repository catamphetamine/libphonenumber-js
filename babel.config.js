module.exports = {
	"presets": [
		"@babel/env"
	],
	"plugins": [
		["@babel/transform-for-of", { "loose": true }],
		"@babel/proposal-class-properties"
	],
	"env": {
		"es6": {
			"presets": [
				["@babel/env", { "modules": false }]
			]
		},
		"nyc": {
			"plugins": [
				"babel-plugin-istanbul"
			]
		}
	}
}
