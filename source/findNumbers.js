import _findNumbers from './findNumbers_.js'
import { normalizeArguments } from './parsePhoneNumber.js'

export default function findNumbers() {
	const { text, options, metadata } = normalizeArguments(arguments)
	return _findNumbers(text, options, metadata)
}