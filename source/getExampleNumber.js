import PhoneNumber from './PhoneNumber'

export default function getExampleNumber(country, examples, metadata)
{
	return new PhoneNumber(country, examples[country], metadata)
}