import PhoneNumber from './PhoneNumber'

export default function getExampleNumber(country, examples, metadata) {
	if (examples[country]) {
		return new PhoneNumber(country, examples[country], metadata)
	}
}