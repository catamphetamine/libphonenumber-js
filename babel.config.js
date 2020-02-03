module.exports = {
	"env":
	{
		"development":
		{
			"presets":
			[
				"@babel/env"
			],

			"plugins":
			[
				["@babel/transform-for-of", { loose: true }],
				"@babel/proposal-class-properties"
			]
		},
		"commonjs":
		{
			"presets":
			[
				"@babel/env"
			],

			"plugins":
			[
				["@babel/transform-for-of", { loose: true }],
				"@babel/proposal-class-properties"
			]
		},
		"es6":
		{
			"presets":
			[
				["@babel/env", { modules: false }]
			],

			"plugins":
			[
				["@babel/transform-for-of", { loose: true }],
				"@babel/proposal-class-properties"
			]
		}
	}
}
