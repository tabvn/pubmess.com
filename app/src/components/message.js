import React from 'react'
import styled from 'styled-components'
import _ from 'lodash'

const Container = styled.div `
  padding: 10px;
  display: flex;
  align-items: flex-start;
  flex-grow: 1;
  min-height: 50px;
 
`

const Avatar = styled.div `
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

const Content = styled.div `
  flex-grow: 1;
  padding: 10px;
  border-radius: 5px;
  
`

const Title = styled.div `
  font-weight: 700;
  font-size: 12px;
  margin-bottom: 8px;
 
`

const Body = styled.div `
  font-size: 12px;

`

class Message extends React.Component {

  render () {
    const {message} = this.props

    const avatar = _.get(message, 'user.avatar')
    return (
      <Container
        className={'message'}>
        <Avatar>
          {
            avatar && <img src={avatar} alt={''}/>
          }
        </Avatar>
        <Content>
          <Title>{`${_.get(message, 'user.name', 'Unknown')}`}</Title>
          <Body>{message.body}</Body>
        </Content>
      </Container>
    )
  }
}

export default Message