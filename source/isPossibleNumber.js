import { normalizeArguments } from './getNumberType'
import _isPossibleNumber from './isPossibleNumber_'

/**
 * Checks if a given phone number is possible.
 * Which means it only checks phone number length
 * and doesn't test any regular expressions.
 *
 * Examples:
 *
 * ```js
 * isPossibleNumber('+78005553535', metadata)
 * isPossibleNumber('8005553535', 'RU', metadata)
 * isPossibleNumber('88005553535', 'RU', metadata)
 * isPossibleNumber({ phone: '8005553535', country: 'RU' }, metadata)
 * ```
 */
export default function isPossibleNumber(arg_1, arg_2, arg_3, arg_4)
{
	const { input, options, metadata } = normalizeArguments(arg_1, arg_2, arg_3, arg_4)
	return _isPossibleNumber(input, options, metadata)
}