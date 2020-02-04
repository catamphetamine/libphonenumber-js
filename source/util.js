/**
 * Checks whether the entire input sequence can be matched
 * against the regular expression.
 * @return {boolean}
 */
export function matchesEntirely(text, regular_expression) {
	// If assigning the `''` default value is moved to the arguments above,
	// code coverage would decrease for some weird reason.
	text = text || ''
	return new RegExp('^(?:' + regular_expression + ')$').test(text)
}

/**
 * Merges two arrays.
 * @param  {*} a
 * @param  {*} b
 * @return {*}
 */
export function mergeArrays(a, b) {
	const merged = a.slice()

	for (const element of b) {
		if (a.indexOf(element) < 0) {
			merged.push(element)
		}
	}

	return merged.sort((a, b) => a - b)

	// ES6 version, requires Set polyfill.
	// let merged = new Set(a)
	// for (const element of b)
	// {
	// 	merged.add(i)
	// }
	// return Array.from(merged).sort((a, b) => a - b)
}