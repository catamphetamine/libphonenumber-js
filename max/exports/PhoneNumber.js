// Importing from a ".js" file is a workaround for Node.js "ES Modules"
// importing system which is even uncapable of importing "*.json" files.
import metadata from '../../metadata.max.json.js'

import { PhoneNumber as _PhoneNumber } from '../../core/index.js'

export function PhoneNumber(number) {
	return _PhoneNumber.call(this, number, metadata)
}
PhoneNumber.prototype = Object.create(_PhoneNumber.prototype, {})
PhoneNumber.prototype.constructor = PhoneNumber
