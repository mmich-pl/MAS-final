const { EnvironmentPlugin } = require('webpack');
require('dotenv').config()

module.exports = {
  plugins: [
    new EnvironmentPlugin([
      'API_KEY',
      'DATABASE_API'
    ])
  ]
}
