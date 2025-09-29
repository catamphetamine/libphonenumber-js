import exec from './exec.js'

// Commits the current changes files in the local git repository.
export default function() {
	console.log()
	console.log('========================================')
	console.log('=          Committing changes          =')
	console.log('========================================')
	console.log()

	console.log(exec('git add .'))

	console.log(exec('git commit -m "Updated metadata"'))
}