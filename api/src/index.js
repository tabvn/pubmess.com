import Server from './modules/server/server'
import Database from './modules/database'

const server = new Server()

server.start(async (app) => {

  app.database = await new Database().connect()

})
