import https from 'https';

export default function download_file(url) {
	return new Promise(function (resolve, reject) {
		var request = https.request(url, function (response) {
			response.setEncoding('utf8');

			var response_body = '';
			response.on('data', function (chunk) {
				return response_body += chunk;
			});
			response.on('end', function () {
				return resolve(response_body);
			});
		});

		request.on('error', reject);
		request.end();
	});
}
//# sourceMappingURL=download.js.map