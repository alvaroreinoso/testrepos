const client = require('./client')

async function init() {
  await client.indices.create({
    index: 'customer',
  })

  await client.indices.create({
    index: 'message',
  })

  await client.indices.create({
    index: 'lane',
  })

  await client.indices.create({
    index: 'team',
  })

  await client.indices.create({
    index: 'lane_partner',
  })

  await client.indices.create({
    index: 'customer_location',
  })

  await client.indices.create({
    index: 'user',
  })

  await client.indices.create({
    index: 'contact',
  })
}

init()
