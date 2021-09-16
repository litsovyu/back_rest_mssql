const fs = require('fs')

module.exports = new Promise(resolve => {
  let secret = {}
  if (fs.existsSync('./.secret.json')) {
    secret = require('./.secret.json')
  }

  resolve({
    development: {
      NODE_ENV: 'development',
      BUCKET: 'tmp-30',
      DB_HOST: 'mssql',
      DB_NAME: 'b2b',
      DB_USER: 'sa',
      DB_PASS: 'cPassword1',
      DB_HOST_DEST: 'uat',
      DB_NAME_DEST: 'b2b',
      DB_USER_DEST: 'sa',
      DB_PASS_DEST: 'cPassword1',
      DUMP_PATH_DEST: '/var/opt/mssql/'
    },
    temp13: {
      NODE_ENV: 'temp13',
      BUCKET: 'b2b-db-backup',
      //берём тут mssql-tempo-0
      DB_HOST: '35.228.92.67',
      DB_NAME: 'temp13db',
      DB_USER: 'temp13',
      DB_PASS: 'temp13temp13',
      //закидываем сюда mssql-0 
      DB_HOST_DEST: '35.228.107.70',
      DB_NAME_DEST: 'temp13dbnew',
      DB_USER_DEST: 'temp13',
      DB_PASS_DEST: 'temp13temp13',
      DUMP_PATH_DEST: '/var/opt/mssql/'
    },
    test: { NODE_ENV: 'test' },
    production: {
      ...secret,
      ...{
        NODE_ENV: 'production'
      }
    }
  })
})
