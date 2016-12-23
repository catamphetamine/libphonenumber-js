// Checks whether the entire input sequence can be matched
// against the regular expression.
export function matches_entirely(text = '', regular_expression)
{
	if (typeof regular_expression === 'string')
	{
		regular_expression = '^(?:' + regular_expression + ')$'
	}

	const matched_groups = text.match(regular_expression)
	return matched_groups && matched_groups[0].length === text.length
}