const AWS_SES = require('../client')

module.exports = async (user, brokerage) => {

  const data = {
    firstName: user.firstName,
    UUID: brokerage.pin
  }

  console.log('data in email template: ', data)

  const params = {
    Source: 'support@terralanes.com',
    Template: "TestCreateAccount",
    Destination: {
      ToAddresses: [
        user.email
      ]
    },
    ConfigurationSetName: 'Config',
    TemplateData: JSON.stringify(data)
  }

  AWS_SES.sendTemplatedEmail(params, async (err, data) => {

    console.log('inside send templated email function')
    if (err) {
      throw err, err.stack
    } else {
      console.log('should have sent', params)
      console.log(data)
    }
  })
}