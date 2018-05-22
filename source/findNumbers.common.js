// Copy-pasted from `PhoneNumberMatcher.js`.

import
{
	PLUS_CHARS
}
from './common'

import
{
	isLatinLetter,
	isInvalidPunctuationSymbol
}
from './utf-8.common'

export const OPENING_PARENS = '(\\[\uFF08\uFF3B'
export const CLOSING_PARENS = ')\\]\uFF09\uFF3D'

export const LEAD_CLASS = `[${OPENING_PARENS}${PLUS_CHARS}]`

// Punctuation that may be at the start of a phone number - brackets and plus signs.
const LEAD_CLASS_LEADING = new RegExp('^' + LEAD_CLASS)

export function isValidCandidate(candidate, offset, text)
{
	// If the candidate is not at the start of the text,
	// and does not start with phone-number punctuation,
	// check the previous character.
	if (offset > 0 && !LEAD_CLASS_LEADING.test(candidate))
	{
		const previousChar = text[offset - 1]
		// We return null if it is a latin letter or an invalid punctuation symbol.
		if (isInvalidPunctuationSymbol(previousChar) || isLatinLetter(previousChar)) {
			return false
		}
	}

	const lastCharIndex = offset + candidate.length
	if (lastCharIndex < text.length)
	{
		const nextChar = text[lastCharIndex]
		if (isInvalidPunctuationSymbol(nextChar) || isLatinLetter(nextChar)) {
			return false
		}
	}

	return true
}