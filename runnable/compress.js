import path from 'path'
import fs from 'fs'

import compress from '../source/tools/compress'

const input = fs.readFileSync(path.join(__dirname, '../metadata.json'), 'utf8')

const output = compress(JSON.parse(input))

fs.writeFileSync(path.join(__dirname, '../metadata.min.json'), JSON.stringify(output))