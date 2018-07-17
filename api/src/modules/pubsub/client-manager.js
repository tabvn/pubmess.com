import uuid from 'uuid/v4'
import { Map } from 'immutable'

class Client {
  constructor (options) {
    this.id = options.id
    this.ws = options.ws
    this.user = options.user
    this.token = options.token
    this.created = options.created
    this.updated = options.updated
  }
}

class ClientManager {

  constructor () {

    this.clients = new Map()
  }

  autoId () {
    return uuid()
  }

  getClients () {
    return this.clients
  }

  /**
   * connect a client
   * @param id
   * @param options
   * @returns {V}
   */
  connect (id, options) {

    id = id ? id : this.autoId()

    const ws = options.ws
    let client = this.clients.get(id)

    if (client) {
      client.ws = ws
      client.updated = new Date()
    } else {
      client = new Client({
        id: id,
        ws: ws,
        user: null,
        token: null,
        created: new Date(),
        updated: null
      })
    }

    this.clients = this.clients.set(id, client)

    return client
  }

  updateId (id, toId) {

    const client = this.get(id)
    if (client) {
      client.id = toId
    }

    this.clients = this.clients.set(id, client)

    return client
  }

  setUser (id, user) {
    const client = this.clients.get(id)
    client.user = user
    this.clients = this.clients.set(id, client)
  }

  /**
   *
   */
  disconnect (id) {
    this.clients = this.clients.remove(id)
  }

  get (id) {
    const client = this.clients.get(id)
    if (client) {
      return client
    }
    return this.clients.find((c) => c.id === id)

  }

  send (id, message) {

    const client = this.get(id)
    if (client && client.ws) {
      try {
        if (typeof message !== 'string') {
          message = JSON.stringify(message)
        }
        client.ws.send(message)
      } catch (e) {

      }
    }
  }
}

export default ClientManager