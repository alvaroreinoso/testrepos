const client = require('./client')

client.indices.delete({
  index: '*',
})
