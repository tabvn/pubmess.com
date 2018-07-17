import { MongoClient } from 'mongodb'
import { DATABASE_NAME, DATABASE_URL } from '../../config'

export default class Database {

  constructor () {
    this.db = null
  }

  async connect () {

    const _this = this
    return new Promise((resolve, reject) => {
      MongoClient.connect(DATABASE_URL, {useNewUrlParser: true}, function (err, client) {
        if (err) {
          return reject(err)
        }
        _this.db = client.db(DATABASE_NAME)
        return resolve(_this)
      })
    })

  }

}