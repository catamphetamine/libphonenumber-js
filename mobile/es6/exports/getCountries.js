import withMetadataArgument from './withMetadataArgument.js'
import { getCountries as _getCountries } from '../../../core/es6/index.js'

export function getCountries() {
	return withMetadataArgument(_getCountries, arguments)
}