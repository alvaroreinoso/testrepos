const AWS_SES = require('../client')
var AES = require('crypto-js/aes')

module.exports.emailUserInvite = async (user, brokerageName) => {
  const encrypted = AES.encrypt(user.email, 'Josh Lyles').toString()
  const encoded = encrypted.replace(/\+/g, 'aFaFa').replace(/\//g, 'bFbFb').replace(/=+$/, 'cFcFc')
  const env = process.env.NODE_ENV

  const data = {
    email: user.email,
    hashedEmail: encoded,
  }

  const params = {
    Source: 'support@terralanes.com',
    Template: 'TestInvite',
    Destination: {
      ToAddresses: [user.email],
    },
    TemplateData: JSON.stringify(data),
  }
  switch (env) {
    case 'staging':
      params.Template = 'StagingInvite'
      break
    case 'production':
      params.Template = 'ProdInvite'
      break
    default:
      break
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

module.exports.testNotify = async (email) => {
  const encrypted = AES.encrypt(email, 'Josh Lyles').toString()
  const encoded = encrypted.replace(/\+/g, 'aFaFa').replace(/\//g, 'bFbFb').replace(/=+$/, 'cFcFc')
  const env = process.env.NODE_ENV

  const data = {
    email: email,
    hashedEmail: encoded,
  }

  const params = {
    Source: 'support@terralanes.com',
    Template: 'StagingUpload',
    Destination: {
      ToAddresses: [email],
    },
    TemplateData: JSON.stringify(data),
  }
  // switch (env) {
  //   case 'staging':
  //     params.Template = 'StagingInvite'
  //     break
  //   case 'production':
  //     params.Template = 'ProdInvite'
  //     break
  //   default:
  //     break
  // }

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
