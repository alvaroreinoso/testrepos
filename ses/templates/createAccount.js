const AWS_SES = require('../client')

module.exports = async (user, brokerage) => {

  const data = {
    firstName: user.firstName,
    UUID: brokerage.pin
  }

  const params = {
    Source: 'support@terralanes.com',
    Template: "TestCreateAccount",
    Destination: {
      ToAddresses: [
        user.email
      ]
    },
    TemplateData: JSON.stringify(data)
  }

  await AWS_SES.sendTemplatedEmail(params, (err) => {
    if (err) console.log(err, err.stack);
  })
}