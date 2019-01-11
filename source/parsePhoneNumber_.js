import parseNumber from './parse_'

export default function parsePhoneNumber(text, options, metadata) {
	return parseNumber(text, { ...options, v2: true }, metadata)
}