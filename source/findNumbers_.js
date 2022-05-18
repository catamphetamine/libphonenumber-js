import PhoneNumberMatcher from './PhoneNumberMatcher.js'

export default function findNumbers(text, options, metadata) {
	const matcher = new PhoneNumberMatcher(text, options, metadata)
	const results = []
	while (matcher.hasNext()) {
		results.push(matcher.next())
	}
	return results
}