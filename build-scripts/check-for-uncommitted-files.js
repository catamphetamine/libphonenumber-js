import getUncommittedChanges from './helpers/getUncommittedChanges.js';
import sendEmail from './helpers/sendEmail.js'

const uncommittedChanges = await getUncommittedChanges()
if (uncommittedChanges.length > 0) {
	const errorText = `You have uncommitted files in your repository:\n\n${uncommittedChanges.map(({ filename }) => filename).join('\n')}`
	console.error(new Error(errorText))
	await sendEmail({
		subject: '[libphonenumber-js] Uncommitted changes found',
		text: errorText
	})
	process.exit(1)
}