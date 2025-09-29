import fs from 'fs'
import gmailSend from 'gmail-send'

export default async function sendEmail({ subject, text }) {
	const emailSettings = getEmailSettings()
	if (emailSettings) {
		// Send an email notification through GMail.
		//
		// Example output:
		//
		// {
		// 	result: '250 2.0.0 OK  1759154240 2adb3069b0e04-58313dd67c4sm4173572e87.55 - gsmtp',
		// 	full: {
		// 		accepted: [ 'kuchumovn@gmail.com' ],
		// 		rejected: [],
		// 		ehlo: [
		// 			'SIZE 35882577',
		// 			'8BITMIME',
		// 			'AUTH LOGIN PLAIN XOAUTH2 PLAIN-CLIENTTOKEN OAUTHBEARER XOAUTH',
		// 			'ENHANCEDSTATUSCODES',
		// 			'PIPELINING',
		// 			'CHUNKING',
		// 			'SMTPUTF8'
		// 		],
		// 		envelopeTime: 297,
		// 		messageTime: 565,
		// 		messageSize: 799,
		// 		response: '250 2.0.0 OK  1759154240 2adb3069b0e04-58313dd67c4sm4173572e87.55 - gsmtp',
		// 		envelope: { from: 'kuchumovn@gmail.com', to: [Array] },
		// 		messageId: '<b7c49e37-1f0f-5c42-13c5-2398a778abd2@gmail.com>'
		// 	}
		// }
		//
		const { result, full } = await gmailSend({
			user: emailSettings.email,
			pass: emailSettings.accessToken,
			to: emailSettings.email,
			subject,
			text
			// html: '<b>html text</b>' // alternative to specifying `text`, one could specify `html`.
		})()
		return true
	}
}

// Reads email settings from a JSON file just outside of `libphonenumber-js` repo folder.
function getEmailSettings() {
	const emailSettingsPath = '../libphonenumber-js-autoupdate-email-notification-settings.json'
	if (fs.existsSync(emailSettingsPath)) {
		const emailSettings = JSON.parse(fs.readFileSync(emailSettingsPath, 'utf-8'))
		// Validate `emailSettings`.
		if (!emailSettings.email) {
			throw new Error('`email` parameter not specified in the email config file')
		}
		// The instructions on how to obtain an `accessToken` are described in `gmail-send` readme:
		// https://www.npmjs.com/package/gmail-send
		if (!emailSettings.accessToken) {
			throw new Error('`accessToken` parameter not specified in the email config file')
		}
		return emailSettings;
	}
}