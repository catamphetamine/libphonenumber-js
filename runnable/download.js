import fs from 'fs'
import download from '../source/tools/download'

const url = process.argv[2]
const output_path = process.argv[3]

download(url).then((contents) =>
{
	fs.writeFileSync(output_path, contents)
})
.catch((error) =>
{
	console.error(error)
	process.exit(1)
})