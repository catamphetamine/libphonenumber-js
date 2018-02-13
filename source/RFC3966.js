import { is_viable_phone_number } from './parse'

/**
 * @param  {string} text - Phone URI (RFC 3966).
 * @return {object} `{ ?number, ?ext }`.
 */
export function parseRFC3966(text)
{
	let number
	let ext

	for (const part of text.split(';'))
	{
		const [name, value] = part.split(':')
		switch (name)
		{
			case 'tel':
				number = value
				break
			case 'ext':
				ext = value
				break
			case 'phone-context':
				// Domain contexts are ignored.
				if (value[0] === '+')
				{
					number = value + number
				}
				break
		}
	}

	// If the phone number is not viable, then abort.
	if (!is_viable_phone_number(number))
	{
		return {}
	}

	return {
		number,
		ext
	}
}

/**
 * @param  {object} - `{ ?countryCallingCode, ?extension }`.
 * @return {string} Phone URI (RFC 3966).
 */
export function formatRFC3966({ countryCallingCode, number, ext })
{
	if (!number)
	{
		return ''
	}

	if (number[0] !== '+' && !countryCallingCode)
	{
		throw new Error(`"formatRFC3966()" expects country calling code (either in the form of "countryCallingCode" or as part of the "number").`)
	}

	const tel = number[0] === '+' ? number : `+${countryCallingCode}${number}`

	return `tel:${tel}${ext ? ';ext=' + ext : ''}`
}