import withMetadataArgument from './withMetadataArgument.js'
import { getCountryName as _getCountryName } from '../../core/index.js'

export function getCountryName() {
	return withMetadataArgument(_getCountryName, arguments)
}