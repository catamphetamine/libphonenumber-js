// Importing from a ".js" file is a workaround for Node.js "ES Modules"
// importing system which is even uncapable of importing "*.json" files.
import metadata from '../../../metadata.mobile.json.js'

import { PhoneNumber as _PhoneNumber } from '../../../core/es6/index.js'

export class PhoneNumber extends _PhoneNumber {
	constructor(number) {
		super(number, metadata)
	}
}
