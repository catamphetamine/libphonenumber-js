import _findNumbers from './findNumbers_'
import { normalizeArguments } from './parsePhoneNumber'

export default function findNumbers() {
	const { text, options, metadata } = normalizeArguments(arguments)
	return _findNumbers(text, options, metadata)
}