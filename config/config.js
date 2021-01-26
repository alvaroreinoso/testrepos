require('dotenv').config()
module.exports = {
  production: {
    use_env_variable: true,
    url: process.env.DB_URL,
    dialect: "postgres"
  },
  staging: {
    use_env_variable: true,
    url: process.env.DB_URL,
    dialect: "postgres",
    ssl:"Amazon RDS"
  },
  development: {
    use_env_variable: true,
    url: "postgres://postgres:postgres@localhost:5432/my-db",
    dialect: "postgres"
  }
}