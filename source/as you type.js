const DIGIT_PLACEHOLDER = '\u2008'
const DIGIT_PATTERN = new RegExp(DIGIT_PLACEHOLDER)

// A pattern that is used to match character classes in regular expressions.
// An example of a character class is [1-4].
const CHARACTER_CLASS_PATTERN = /\[([^\[\]])*\]/g

// Any digit in a regular expression that actually denotes a digit. For
// example, in the regular expression 80[0-2]\d{6,10}, the first 2 digits
// (8 and 0) are standalone digits, but the rest are not.
// Two look-aheads are needed because the number following \\d could be a
// two-digit number, since the phone number can be as long as 15 digits.
const STANDALONE_DIGIT_PATTERN = '...'

export default function as_you_type()
{
	// ...
}