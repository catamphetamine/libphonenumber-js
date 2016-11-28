import parse from './parse'

export default function is_valid(number, country_code)
{
	return Object.keys(parse(number, country_code)).length > 0
}