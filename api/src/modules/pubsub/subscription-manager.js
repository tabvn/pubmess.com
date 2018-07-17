import uuid from 'uuid/v4'
import { OrderedMap, Map } from 'immutable'

class Subscription {

  constructor (options) {

    this.id = options.id
    this.clientId = options.clientId
    this.callback = options.callback
    this.created = new Date()
    this.topic = options.topic

  }
}

class Topic {

  constructor (name) {
    this.name = name
    this.subscribers = new OrderedMap()
  }

  getSubscriptionId (client) {
    return client ? `${client.id}:${this.name}` : uuid()
  }

  addSubscriber (client = null, cb = null) {

    const id = this.getSubscriptionId(client)

    const subscription = new Subscription({
        id: id,
        clientId: client ? client.id : null,
        callback: cb,
        topic: this.name
      }
    )

    this.subscribers = this.subscribers.set(id, subscription)

    return subscription
  }

  removeSubscriber (client, id = null) {
    if (!id) {
      id = this.getSubscriptionId(client)
    }
    this.subscribers = this.subscribers.remove(id)

    return id
  }

  removeAllSubscribers () {
    this.subscribers = this.subscribers.clear()
  }

  getSubscribers () {
    return this.subscribers
  }

}

export default class SubscriptionManager {

  constructor () {
    this.topics = new OrderedMap()
    this.subscriptions = new Map()

  }

  getTopics () {
    return this.topics
  }

  subscribe (topicName, client, cb = null) {
    let topic = this.topics.get(topicName)
    if (!topic) {
      topic = new Topic(topicName)

    }

    this.topics = this.topics.set(topicName, topic)
    const subscription = topic.addSubscriber(client, cb)
    this.subscriptions = this.subscriptions.set(subscription.id, subscription)

    return subscription
  }

  unsubscribe (topicName, client) {
    const topic = this.topics.get(topicName)
    if (topic) {
      const subscriptionId = topic.removeSubscriber(client)
      this.subscriptions = this.subscriptions.remove(subscriptionId)
    }
  }

  isSubscribed (topicName, client) {
    const topic = this.topics.get(topicName)

    if (topic) {
      const subscription = this.getSubscribers(topicName).find((s) => s.clientId === client.id)
      return !!subscription
    } else {

      return false
    }

  }

  unsubscribeAll (client) {

    this.subscriptions.filter((sub) => sub.clientId === client.id).forEach((subscription) => {

      const topic = this.topics.get(subscription.topic)
      if (topic) {
        const subscriptionId = topic.removeSubscriber(client)
        this.subscriptions = this.subscriptions.remove(subscriptionId)

      }

    })
  }

  getSubscribers (topicName) {

    const topic = this.topics.get(topicName)

    if (!topic) {
      return null
    }

    return topic.getSubscribers()
  }

  removeSubscription (id) {
    const subscription = this.subscriptions.get(id)
    if (!subscription) {
      return
    }

    const topic = this.topics.get(subscription.topic)
    topic.removeSubscriber(null, id)

  }

}