// Checks whether the entire input sequence can be matched
// against the regular expression.
export function matchesEntirely(text = '', regular_expression)
{
	return new RegExp('^(?:' + regular_expression + ')$').test(text)
}