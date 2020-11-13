// Importing from `.json.js` a workaround for a bug in web browsers' "native"
// ES6 importing system which is uncapable of importing "*.json" files.
// https://github.com/catamphetamine/libphonenumber-js/issues/239
import metadata from '../metadata.full.json.js'
export default metadata

export function withMetadata(func, _arguments) {
	var args = Array.prototype.slice.call(_arguments)
	args.push(metadata)
	return func.apply(this, args)
}