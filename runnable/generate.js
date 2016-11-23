import generate from '../source/generate'

import path from 'path'
import fs from 'fs'

const input = fs.readFileSync(path.join(__dirname, process.argv[2]), 'utf8')

generate(input).then((output) =>
{
	fs.writeFileSync(path.join(__dirname, '../metadata.json'), JSON.stringify(output, undefined, 3))
})