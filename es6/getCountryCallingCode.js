import Metadata from './metadata';

export default function (country, metadata) {
	metadata = new Metadata(metadata);

	if (!metadata.hasCountry(country)) {
		throw new Error('Unknown country: ' + country);
	}

	return metadata.country(country).countryCallingCode();
}
//# sourceMappingURL=getCountryCallingCode.js.map