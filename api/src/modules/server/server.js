import http from 'http'
import express from 'express'
import path from 'path'
import WebSocketServer from 'uws'
import cors from 'cors'
import { PORT, ROOT } from '../../config'
import 'babel-polyfill'
import PubSub from '../pubsub'

export default class Server {

  constructor (options = null) {

    this.options = options
    this.app = express()
    this.app.use(express.json())
    this.app.use(cors({
      exposedHeaders: '*',
    }))

    this.app.server = http.createServer(this.app)
    this.app.wss = new WebSocketServer.Server({
      server: this.app.server,
    })

    this.app.pubsub = new PubSub(this.app)
  }

  start (cb) {
    const port = this.options && this.options.port ? this.options.port : PORT

    this.app.use(express.static(path.join(ROOT, 'public')))

    this.app.get('/stats', (req, res) => {

      res.json({
        connections: this.app.pubsub.getClients().size,
        topics: this.app.pubsub.getTopics().size,
      })
    })

    this.app.get('/*', (req, res) => {
      res.sendFile(path.join(ROOT, 'public/index.html'))
    })

    this.app.server.listen(port, (err) => {

      console.log(`App is running on port ${this.app.server.address().port}`)
      cb(this.app)
    })

  }
}