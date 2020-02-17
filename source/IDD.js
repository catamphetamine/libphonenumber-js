import Metadata from './metadata'
import { VALID_DIGITS } from './constants'

const CAPTURING_DIGIT_PATTERN = new RegExp('([' + VALID_DIGITS + '])')

/**
 * Pattern that makes it easy to distinguish whether a region has a single
 * international dialing prefix or not. If a region has a single international
 * prefix (e.g. 011 in USA), it will be represented as a string that contains
 * a sequence of ASCII digits, and possibly a tilde, which signals waiting for
 * the tone. If there are multiple available international prefixes in a
 * region, they will be represented as a regex string that always contains one
 * or more characters that are not ASCII digits or a tilde.
 */
const SINGLE_IDD_PREFIX = /^[\d]+(?:[~\u2053\u223C\uFF5E][\d]+)?$/

// For regions that have multiple IDD prefixes
// a preferred IDD prefix is returned.
export function getIDDPrefix(country, callingCode, metadata) {
	const countryMetadata = new Metadata(metadata)
	countryMetadata.selectNumberingPlan(country, callingCode)
	if (SINGLE_IDD_PREFIX.test(countryMetadata.IDDPrefix())) {
		return countryMetadata.IDDPrefix()
	}
	return countryMetadata.defaultIDDPrefix()
}

export function stripIDDPrefix(number, country, callingCode, metadata) {
	if (!country) {
		return
	}
	// Check if the number is IDD-prefixed.
	const countryMetadata = new Metadata(metadata)
	countryMetadata.selectNumberingPlan(country, callingCode)
	const IDDPrefixPattern = new RegExp(countryMetadata.IDDPrefix())
	if (number.search(IDDPrefixPattern) !== 0) {
		return
	}
	// Strip IDD prefix.
	number = number.slice(number.match(IDDPrefixPattern)[0].length)
	// Some kind of a weird edge case.
	// No explanation from Google given.
	const matchedGroups = number.match(CAPTURING_DIGIT_PATTERN)
	/* istanbul ignore next */
	if (matchedGroups && matchedGroups[1] != null && matchedGroups[1].length > 0) {
		if (matchedGroups[1] === '0') {
			return
		}
	}
	return number
}