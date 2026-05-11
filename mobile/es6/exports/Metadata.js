// Importing from a ".js" file is a workaround for Node.js "ES Modules"
// importing system which is even uncapable of importing "*.json" files.
import metadata from '../../../metadata.mobile.json.js'

import { Metadata as _Metadata } from '../../../core/es6/index.js'

export class Metadata extends _Metadata {
	constructor() {
		super(metadata)
	}
}
