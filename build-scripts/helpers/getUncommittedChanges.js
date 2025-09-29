import { exec } from 'child_process'

export default function getUncommittedChanges() {
	return new Promise((resolve, reject) => {
		exec('git status --porcelain', (error, stdout, stderr) => {
			if (error) {
				reject(error);
				return
			}

			if (stderr) {
				reject(new Error(stderr.toString()))
				return
			}

			const output = stdout.toString().trim()

			if (!output) {
				resolve([]);
			}

			const uncommittedFiles = output.trim().split('\n').map((line) => {
				line = line.trim()
				const whitespaceIndex = line.indexOf(' ')
				const status = line.slice(0, whitespaceIndex)
				const filename = line.slice(whitespaceIndex + ' '.length)
				return { status, filename }
			})

			resolve(uncommittedFiles)
		})
	})
}