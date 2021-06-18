const AWS_SES = require('../client')
var AES = require("crypto-js/aes");

module.exports = async (user, brokerageName) => {
    const encrypted = AES.encrypt(user.email, "Josh Lyles").toString()
    const encoded = encrypted.replace(/\+/g, 'aFaFa').replace(/\//g, 'bFbFb').replace(/=+$/, 'cFcFc')

    const data = {
        email: user.email,
        hashedEmail: encoded
    }

    const params = {
        Source: 'support@terralanes.com',
        Template: "TestInvite",
        Destination: {
            ToAddresses: [
                user.email
            ]
        },
        TemplateData: JSON.stringify(data)
    }

    function sendEmail(params) {
        return new Promise((r, x) => {
          AWS_SES.sendTemplatedEmail(params, (err, data) => {
            console.log('inside test email function')
            if (err) {
              x(err)
            } else {
              r(data)
            }
          })
        })
      }
    
    return await sendEmail(params)

}