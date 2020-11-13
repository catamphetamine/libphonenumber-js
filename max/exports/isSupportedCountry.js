import { withMetadata } from '../metadata'
import { isSupportedCountry as _isSupportedCountry } from '../../core/index'

export function isSupportedCountry() {
	return withMetadata(_isSupportedCountry, arguments)
}