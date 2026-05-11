// Importing from a ".js" file is a workaround for Node.js "ES Modules"
// importing system which is even uncapable of importing "*.json" files.
import metadata from '../../../metadata.mobile.json.js'

import { PhoneNumberMatcher as _PhoneNumberMatcher } from '../../../core/es6/index.js'

export class PhoneNumberMatcher extends _PhoneNumberMatcher {
	constructor(text, options) {
		super(text, options, metadata)
	}
}
