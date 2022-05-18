import { withMetadata } from '../metadata.js'
import { isSupportedCountry as _isSupportedCountry } from '../../core/index.js'

export function isSupportedCountry() {
	return withMetadata(_isSupportedCountry, arguments)
}