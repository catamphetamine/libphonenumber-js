import withMetadataArgument from './withMetadataArgument.js'
import { getExampleNumber as _getExampleNumber } from '../../../core/es6/index.js'

export function getExampleNumber() {
	return withMetadataArgument(_getExampleNumber, arguments)
}