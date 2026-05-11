import withMetadataArgument from './withMetadataArgument.js'
import { isPossiblePhoneNumber as _isPossiblePhoneNumber } from '../../../core/es6/index.js'

export function isPossiblePhoneNumber() {
	return withMetadataArgument(_isPossiblePhoneNumber, arguments)
}