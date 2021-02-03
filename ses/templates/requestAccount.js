const AWS_SES = require('../client')

module.exports = async (user) => {

  const data = {
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.title,
    phone: user.phone,
    ext: user.phoneExt,
    email: user.email
  }

  const params = {
    Source: 'support@terralanes.com',
    Template: "RequestAccount",
    Destination: {
      ToAddresses: [
        user.email
      ]
    },
    TemplateData: JSON.stringify(data)
  }

  AWS_SES.sendTemplatedEmail(params, (err) => {
    if (err) console.log(err, err.stack);
  })
}