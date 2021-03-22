const AWS_SES = require('../client')

module.exports = async (user, brokerageName) => {

    const data = {
        email: user.email,
        brokerageName: brokerageName,
        userId: user.id
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

    // AWS_SES.sendTemplatedEmail(params, (data, err) => {

    //     console.log(data)
    //     if (err) console.log(err, err.stack);
    // })

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