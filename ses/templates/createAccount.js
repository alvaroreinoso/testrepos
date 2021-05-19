const AWS_SES = require('../client')

module.exports = async (user) => {

  const data = {
    firstName: user.firstName,
    username: user.username
  }

  console.log('data in email template: ', data)

  const params = {
    Source: 'support@terralanes.com',
    Template: "CreateAccount",
    Destination: {
      ToAddresses: [
        user.email
      ]
    },
    ConfigurationSetName: 'Config',
    TemplateData: JSON.stringify(data)
  }

  console.log('past params')

  function sendEmail(params) {
    return new Promise((r, x) => {
      AWS_SES.sendTemplatedEmail(params, (err, data) => {
        console.log('inside send templated email function')
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