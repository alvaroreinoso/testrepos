require('dotenv').config()
const AWS = require('aws-sdk');

const SES_CONFIG = {
    accessKeyId: process.env.SES_ACCESS_KEY_ID,
    secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
    region: 'us-east-1'
}

const AWS_SES = new AWS.SES(SES_CONFIG);

module.exports = AWS_SES