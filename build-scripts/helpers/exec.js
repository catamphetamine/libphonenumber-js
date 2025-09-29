import { execSync } from 'child_process'

// Executes a command.
export default function exec(command) {
	return execSync(command).toString().trim()
}