import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _ from 'lodash'
import { setUser } from '../redux/actions'

const Container = styled.form `
  border-top: 1px solid rgba(0,0,0,0.05);
  padding: 10px;
  background: #FFF;
  display: flex;
  height: 100px;
  textarea{
    flex-grow: 1;
    outline: 0 none;
    width: 100%;
    height: 100%;
    border: 0 none;
    padding: 5px 10px;
    resize: none;
  }
`

const Avatar = styled.div `
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0,0,0,0.04);
  margin-right: 10px;
  img{
    max-width: 100%;
    border-radius: 50%;
    width: 40px;
    height: 40px;
  }
`
const Button = styled.button `
  padding: 5px 10px;
  font-size: 15px;
  border: 0 none;
  outline: 0 none;
  background: transparent;
  font-weight: 700;
  &:hover,&:active,&:focus{
    outline: 0 none;
  }
 
`

class Composer extends React.Component {

  constructor (props) {
    super(props)

    this._onChange = this._onChange.bind(this)
    this.submit = this.submit.bind(this)

    this.state = {
      body: '',
      attachments: [],
      user: null,
      emoji: false
    }
  }

  _onChange = (event) => {
    this.setState({
      body: event.target.value
    })
  }

  _send () {

    if (this.props.onSend) {
      const message = {
        body: this.state.body,
        attachments: this.state.attachments,
        user: this.state.user
      }
      this.setState({
        body: '',
        attachments: [],
        emoji: false,
        user: this.props.user,

      }, () => {
        this.props.onSend(message)
      })

    }
  }

  isCommand (message) {

    let isCommand = false

    message = _.trim(_.toLower(message))
    if (!message || _.trim(message) === '') {
      return false
    }
    const commands = [
      'set name',
      'set avatar'
    ]
    commands.forEach((cmd) => {

      if (message.startsWith(cmd)) {
        isCommand = cmd
      }
    })
    return isCommand
  }

  getCommandValue (message) {

    message = _.trim(message)
    const arr = _.split(message, '=')
    return _.replace(_.trim(_.get(arr, '[1]', '')), new RegExp('"', 'g'), '')

  }

  submit (event) {
    let {user} = this.props

    event.preventDefault()

    const cmd = this.isCommand(this.state.body)

    if (!cmd) {
      this._send()
    } else {

      const cmdValue = this.getCommandValue(this.state.body)

      switch (cmd) {

        case 'set name':

          if (user === null) {
            user = {
              name: ''
            }
          }

          user.name = cmdValue
          this.props.setUser(user)

          break

        case 'set avatar':

          if (user === null) {
            user = {
              name: '',
              avatar: ''
            }
          }

          user.avatar = cmdValue

          this.props.setUser(user)

          break

        default:

          break
      }

      this.setState({
        body: '',
        user: user,
      })

    }
  }

  render () {

    let {user} = this.props

    const name = _.get(user, 'name', 'Unknown')

    const isDisabled = !this.state.body || _.trim(this.state.body) === ''
    return (
      <Container onSubmit={this.submit}>
        <Avatar onClick={() => {
          this.setState({
            body: `set name = "${name}"`
          })
        }}>
          {user && user.avatar && <img src={user.avatar} alt={name}/>}
        </Avatar>
        <textarea
          placeholder={'Type your message...'}
          value={this.state.body}
          onKeyPress={(event) => {
            if (event.shiftKey === false && event.key === 'Enter') {
              event.preventDefault()
              if (!isDisabled) {
                this.submit(event)
              }

            }
          }}
          onChange={this._onChange}/>
        <Button
          disabled={isDisabled}
          type={'submit'}>Send</Button>
      </Container>
    )
  }
}

const mapStateTopProps = (state) => ({
  user: state.app.user,
})

const mapDispatchToProps = (dispatch) => bindActionCreators({
  setUser
}, dispatch)

export default connect(mapStateTopProps, mapDispatchToProps)(Composer)