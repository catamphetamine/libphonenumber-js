import child_process from 'child_process'

// Executes a command.
export default function exec(command)
{
	return child_process.execSync(command).toString().trim()
}