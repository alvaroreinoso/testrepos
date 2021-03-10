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

  console.log('past params')

  // return new Promise((r, x) => {
    return await AWS_SES.sendTemplatedEmail(params, (err, data) => {
      console.log('inside send templated email function')
      if (err) {
        x(err)
      } else {
        r(data)
      }
    })
  // })
}