import Metadata from './metadata'

export default function getCountries(metadata) {
	return new Metadata(metadata).getCountries()
}