// Importing from a ".js" file is a workaround for Node.js "ES Modules"
// importing system which is even uncapable of importing "*.json" files.
import metadata from '../../../metadata.max.json.js'

import { AsYouType as _AsYouType } from '../../../core/es6/index.js'

export class AsYouType extends _AsYouType {
	constructor(country) {
		super(country, metadata)
	}
}
