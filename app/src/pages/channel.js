import React from 'react'
import Layout from '../layout'
import Messages from '../components/messages'
import styled from 'styled-components'
import Composer from '../components/composer'
import MessageHeader from '../components/message-header'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _ from 'lodash'

const Container = styled.div `
  display: flex;
  flex-direction: column;
 
`

let subscriptions = []

class Channel extends React.Component {

  constructor (props) {
    super(props)

    this.addUser = this.addUser.bind(this)

    this.state = {
      messages: [],
      users: [],
    }
  }

  componentDidMount () {

    const {user } = this.props

    const messageTopic = this.messageTopicId()

    subscriptions.push(messageTopic)

    this.props.subscribe(messageTopic, (message) => {

      message.created = new Date()

      let users = this.state.users
      const user = _.get(message, 'user')
      const userId = _.get(user, '_id')
      const findIndex = this.state.users.findIndex((u) => u._id === _.get(user, '_id'))
      if (findIndex === -1) {
        const userDisconnectTopic = `users/disconnect/${userId}`
        subscriptions.push(userDisconnectTopic)

        this.props.subscribe(userDisconnectTopic, () => {

          const _users = this.state.users.filter((u) => u._id !== userId)
          this.setState({
            users: _users
          })

        })

        users.push(user)
      } else {
        users[findIndex].name = _.get(user, 'name')
      }

      this.setState({
        messages: [
          ...this.state.messages,
          message
        ],
        users: users,
      })
    })

    const groupId = this.groupId()
    const subscriberTopic = `${groupId}/users`
    subscriptions.push(subscriberTopic)

    this.props.subscribe(subscriberTopic, (message) => {

      this.addUser(_.get(message, 'user'))

      this.props.broadcast(`camera_join_123`, {from: user._id}); // test


    })

    this.props.broadcast(subscriberTopic, {user: this.props.user})

  }

  addUser (user) {
    let users = this.state.users
    const findIndex = this.state.users.findIndex((u) => u._id === _.get(user, '_id'))
    if (findIndex === -1) {
      users.push(user)
    } else {
      users[findIndex].name = _.get(user, 'name')
    }

    this.setState({
      users: users,
    })
  }

  componentWillUnmount () {

    if (subscriptions.length) {
      subscriptions.forEach((topic) => {
        this.props.unsubscribe(topic)
      })
      subscriptions = []
    }
  }

  groupId () {

    return _.get(this.props, 'match.params.id', null)
  }

  messageTopicId () {
    const groupId = this.groupId()
    return `groups/${groupId}/messages`
  }

  render () {
    const messageTopic = this.messageTopicId()

    return (
      <Layout>
        <Container>
          <MessageHeader users={this.state.users}/>
          <Messages messages={this.state.messages}/>
          <Composer onSend={(message) => {

            message.user = this.props.user

            this.setState({
              messages: [...this.state.messages, message]
            }, () => {
              this.props.broadcast(messageTopic, message)
            })
          }}/>
        </Container>

      </Layout>
    )
  }
}

const mapStateTopProps = (state) => ({
  user: state.app.user,
})

const mapDispatchToProps = (dispatch) => bindActionCreators({
  subscribe: (topic, cb) => {
    return (dispatch, getState, {service, pubSub}) => {
      pubSub.subscribe(topic, cb)
    }
  },
  unsubscribe: (topic) => {
    return (dispatch, getState, {service, pubSub}) => {
      pubSub.unsubscribe(topic)
    }
  },
  broadcast: (topic, message) => {
    return (dispatch, getState, {service, pubSub}) => {
      pubSub.broadcast(topic, message)
    }
  }
}, dispatch)

export default connect(mapStateTopProps, mapDispatchToProps)(Channel)