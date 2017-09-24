var child_process = require('child_process')

module.exports = function exec(command)
{
	return child_process.execSync(command).toString().trim()
}