const AWS_SES = require('../client')

module.exports = async (request) => {

  const data = {
    firstName: request.firstName,
    lastName: request.lastName,
    role: request.role,
    phone: request.phone,
    ext: request.ext,
    email: request.email
  }

  const params = {
    Source: 'support@terralanes.com',
    Template: "RequestAccount",
    Destination: {
      ToAddresses: [
        'john@terralanes.com'
      ]
    },
    TemplateData: JSON.stringify(data)
  }

  function sendEmail(params) {
    return new Promise((r, x) => {
      AWS_SES.sendTemplatedEmail(params, (err, data) => {
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