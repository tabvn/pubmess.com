import ClientManager from './client-manager'
import { stringToJson } from '../utils'
import _ from 'lodash'
import SubscriptionManager from './subscription-manager'

export default class PubSub {

  constructor (app) {

    this.wss = app.wss
    this.database = app.database
    this.client = new ClientManager()
    this.subscription = new SubscriptionManager()

    this._init = this._init.bind(this)
    this.subscribe = this.subscribe.bind(this)
    this.publish = this.publish.bind(this)
    this.unsubscribe = this.unsubscribe.bind(this)

    this._init()
  }

  getClients () {

    return this.client.getClients()
  }

  getTopics () {

    return this.subscription.getTopics()
  }

  formatTopic (topic) {

    topic = _.replace(topic, /\\/g, '')

    return topic
  }

  /**
   * Init pubsub server
   * @private
   */
  _init () {

    this.wss.on('connection', (ws) => {

      let client = this.client.connect(null, {ws: ws})

      ws.on('close', () => {

        const userId = _.get(client, 'user._id')

        if (userId) {
          this.publish(`users/disconnect/${userId}`, _.get(client, 'user'), client.id)
        }

        this.subscription.unsubscribeAll(client)
        this.disconnect(client.id)

      })

      ws.on('message', (message) => {


        if (typeof message === 'string') {

          message = stringToJson(message)

          const action = _.get(message, 'action', null)

          let topic = null

          switch (action) {

            case 'connect':

              const clientId = _.get(message, 'payload.id')
              const user = _.get(message, 'payload.user')

              if (clientId) {
                client.id = clientId
                this.client.updateId(client.id, clientId)
              }

              if (user) {
                client.user = user
                this.client.setUser(client.id, user)
              }

              break

            case 'subscribe':

              topic = this.formatTopic(_.get(message, 'payload.topic'))

              this.subscription.subscribe(topic, client)

              break

            case 'publish':

              topic = this.formatTopic(_.get(message, 'payload.topic'))
              this.publish(topic, _.get(message, 'payload.message'))

              break

            case 'broadcast':

              topic = _.get(message, 'payload.topic')

              this.publish(topic, _.get(message, 'payload.message'), client.id)

              break

            case 'unsubscribe':

              topic = _.get(message, 'payload.topic')
              this.subscription.unsubscribe(topic, client)

              break

            case 'unsubscribeAll':

              topic = _.get(message, 'payload.topic')
              this.subscription.unsubscribeAll(client)

              break

            default:

              break
          }
        } else {
          console.log('Wrong message type')
        }

      })

    })
  }

  publish (topic, message, excludeClientId = null) {

    const subscribers = this.subscription.getSubscribers(topic)

    if (subscribers) {
      subscribers.forEach((subscriber) => {

        if (subscriber.clientId && subscriber.clientId !== excludeClientId) {

          const payload = {
            action: 'publish',
            payload: {
              topic: topic,
              message: message
            }
          }
          if (subscriber.callback) {
            subscriber.callback(message)
          }

          this.client.send(subscriber.clientId, payload)
        }
      })
    }
  }

  subscribe (topic, callback) {
    const subscription = this.subscription.subscribe(topic, null, callback)
    return subscription.id
  }

  unsubscribe (id) {
    this.subscription.removeSubscription(id)
  }

  disconnect (sid) {
    this.client.disconnect(sid)
  }

}