import _findNumbers from './findNumbers_'
import { normalizeArguments } from './parsePhoneNumber'

export default function findNumbers(arg_1, arg_2, arg_3, arg_4)
{
	const { text, options, metadata } = normalizeArguments(arg_1, arg_2, arg_3, arg_4)
	return _findNumbers(text, options, metadata)
}