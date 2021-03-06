#!/usr/bin/env node

import fs from 'fs'
import zlib from 'zlib'
import { exec } from 'child_process'
import checkEnvLib from '@47ng/check-env'
import { Storage } from '@google-cloud/storage'
import { pipeline } from 'stream'
import path from 'path'

checkEnvLib.default({
  required: ['DB_HOST', 'DB_NAME', 'DUMP_PATH', 'BUCKET']
})

const {
  DB_HOST: dbHost,
  DB_NAME: dbName,
  DB_USER: dbUser,
  DB_PASS: dbPass,
  DUMP_PATH: dumpPath,
  DB_PORT: dbPort,
  DB_HOST_DEST: dbHost_dest,
  DB_NAME_DEST: dbName_dest,
  DB_USER_DEST: dbUser_dest,
  DB_PASS_DEST: dbPass_dest,
  DUMP_PATH_DEST: dumpPath_dest,
  DB_PORT_DEST: dbPort_dest,
  BUCKET: bucket
} = process.env

const { unlink } = fs.promises

// Imports the Google Cloud client library
const storage = new Storage()

;(async () => {
  try {
    const file = `${dbName}-${new Date()
    //const file = `${dumpPath}${dbName}-${new Date()  
      .toISOString()
      .replace(/\D/g, '-')
      .slice(0, -5)}.bak`
    console.log('file: ', file)


    // f:\\file


    const result = await execPromise(
      `sqlcmd -S ${dbHost} ${dbUser ? '-U ' + dbUser : ''} ${
      //`sqlcmd -S ${dbHost}${dbPort} ${dbUser ? '-U ' + dbUser : ''} ${  
        dbPass ? '-P ' + dbPass : ''
      }  -Q "BACKUP DATABASE [${dbName}] TO DISK='${dumpPath}${file}'"`
    )
    console.log('stdout: ', result)

    await gzip(`${dumpPath}${file}`)
    // await gzip(file)
    console.log('gziped')

    //await storage.bucket(bucket).upload(file, {})
    await storage.bucket(bucket).upload(`${dumpPath}${file}.gz`, {})
    console.log(`copied to bucket`)
/////////////////////////////////начало творчества/////////////////////////////////////////////////////////
   // const resultcopy = await execPromise(
   //   `scp ${file}.gz ${dbUser_dest}@${dbHost_dest}${dbPort_dest}:${dumpPath_dest}${file}.gz`
   // )
   // console.log(resultcopy)
    
    // разархивировать
    //const resultarch = await execPromise(
    //  `
    //  ssh ${dbUser_dest}@${dbHost_dest}${dbPort_dest} &&
    //  gunzip ${dumpPath_dest}${file}.gz ${dumpPath_dest}${dbName_dest} &&
    //  exit`
    //)
    //console.log(resultarch)
    
    // дропнуть старую базу
    // const resultdrop = await execPromise(
    //   `sqlcmd -E -S ${dbHost_dest}${dbPort_dest} ${dbUser_dest ? '-U ' + dbUser_dest : ''} ${dbPass_dest ? '-P ' + dbPass_dest : ''} -Q "DROP DATABASE [${dbName_dest}]"`
    // )
    // console.log(resultdrop)
      
    // // развернуть скопированную
    // const resultrest = await execPromise(
    //   `sqlcmd -E -S ${dbHost_dest}${dbPort_dest} ${dbUser_dest ? '-U ' + dbUser_dest : ''} ${dbPass_dest ? '-P ' + dbPass_dest : ''} -Q "RESTORE DATABASE [${dbName_dest}] FROM DISK='${dumpPath_dest}${dbName_dest}'  WITH NORECOVERY"`
    // )
    // console.log(resultrest)

    // удалить бекап
    //const resultdel = await execPromise(
    //  `
    //  ssh ${dbUser_dest}@${dbHost_dest}${dbPort_dest}
    //  rm ${dumpPath_dest}${dbName_dest}
    //  exit`
    //)
    //console.log(resultdel)    
///////////////////////////////////конец/////////////////////////////////////////////////////////////
  
    // fs.unlink(file, err => {
    //   if (err) {
    //     console.log(err)
    //   }
    // })
    // fs.unlink(`${file}.gz`, err => {
    //   if (err) {
    //     console.log(err)
    //   }
    // })
    // const deleteBak = unlink(file)
    // const deleteBakGz = unlink(`${file}.gz`)

    // await Promise.all([deleteBak, deleteBakGz])
    console.log(`local files deleted`)
  } catch (e) {
    console.error(e)
  }
})()

async function gzip(file) {
  const fileContents = fs.createReadStream(file)
  const writeStream = fs.createWriteStream(`${file}.gz`)
  const zip = zlib.createGzip()
  console.log(file)
  pipeline(fileContents, zip, writeStream, (err) => {
    if(err) {
      console.log(err)
      process.exitCode = 1
    }
  })

  // return new Promise((resolve, reject) => {
  //   const fileContents = fs.createReadStream(file)
  //   const writeStream = fs.createWriteStream(`${file}.gz`)
  //   const zip = zlib.createGzip()
  //   fileContents
  //     .pipe(zip)
  //     .pipe(writeStream)
  //     .on('finish', err => {
  //       if (err) {
  //         return reject(err)
  //       }
  //       resolve()
  //     })
  // })
}

async function execPromise(command) {
  return new Promise(function (resolve, reject) {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(stderr)
        return reject(error)
      }

      resolve(stdout.trim())
    })
  })
}
