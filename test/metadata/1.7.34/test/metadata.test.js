import metadata from '../metadata.min.json'

import Metadata from '../../../../source/metadata'

describe('metadata', () => {
	it('should cover non-occuring edge cases', () => {
		new Metadata(metadata).getNumberingPlanMetadata('999')
	})
})