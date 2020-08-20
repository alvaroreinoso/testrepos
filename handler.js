'use strict';
const { Client } = require('pg')
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'my-db',
  password: 'postgres',
  port: 5432
})
client.connect()

module.exports.hello = async event => {
  let results = await client.query('SELECT * FROM customer', (err, res) => {
    // console.log(err, res)
    client.end()
    return res
  })
  return {
    statusCode: 200,
    body: JSON.stringify(results),
    // body: JSON.stringify(
    //   {
    //     message: 'Go Serverless v1.0! Your function executed successfully!',
    //     input: event,
    //   },
    //   null,
    //   2
    // ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.getLane = async event => {
  let lanes = client.query('SELECT * FROM lane', (err, res) => {
    console.log(res)
    return res
  })
  return {
    statusCode: 200,
    results: JSON.stringify(lanes)
  }

};
