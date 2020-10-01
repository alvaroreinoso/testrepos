
async function run() {
const jso = {"body":{"username":"test-test-test","email":"test@gmail.com","brokerageId":3}}

const test = await jso.toString()

console.log(test)


const res = await JSON.parse(`${jso}`)

await console.log(res)
}

run()