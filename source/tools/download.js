import https from 'https'

export default function download_file(url)
{
	return new Promise((resolve, reject) =>
	{
		const request = https.request(url, (response) =>
		{
			response.setEncoding('utf8')

			let response_body = ''
			response.on('data', chunk => response_body += chunk)
			response.on('end', () => resolve(response_body))
		})

		request.on('error', reject)
		request.end()
	})
}