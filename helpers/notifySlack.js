const fetch = require('node-fetch');
const reqURL = `https://hooks.slack.com/services/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`;
require('dotenv').config()

module.exports.notifySlack = async (user) => {
    const domain = user.email.split('@')[1]

    if (domain !== 'terralanes.com' && process.env.SLACK_SIGNUP_NOTIFICATION === 'true' ) {
        const message = {
            "fallback": 'test',
            "text": `${user.email} signed up`
        }
    
        await fetch(reqURL, {
            method: 'post',
            body: JSON.stringify(message),
            headers: { 'Content-Type': 'application/json' },
        })
    }
}