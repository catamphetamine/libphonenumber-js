import parseNumber from './parse_.js'

export default function parsePhoneNumber(text, options, metadata) {
	return parseNumber(text, { ...options, v2: true }, metadata)
}