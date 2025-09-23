import getUncommittedChanges from './helpers/getUncommittedChanges.js';

getUncommittedChanges().then((uncommittedChanges) => {
	if (uncommittedChanges.length > 0) {
		console.error(new Error(`You have uncommitted files in your repository:\n${uncommittedChanges.map(({ filename }) => filename).join('\n')}`))
		process.exit(1)
	}
}).catch((error) => {
	console.error(error)
	process.exit(1)
})