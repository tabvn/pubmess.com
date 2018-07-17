import React from 'react'
import styled from 'styled-components'
import _ from 'lodash'

const List = styled.div `
  display: flex;
  flex-direction: row;
  padding: 10px 0;
  height: 70px;
 
`

const Item = styled.div `
  display: flex;
  flex-direction: row;
  padding: 0 10px;
  align-items: center;
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

const Name = styled.div `
  font-weight: 700;
`
export default class MessageHeader extends React.Component {

  render () {

    let {users} = this.props

    return (
      <List>
        {users.map((user, index) => {
          return (
            <Item key={index}>
              <Avatar>
                {_.get(user, 'avatar') && (<img src={user.avatar} alt={''}/>)}
              </Avatar>
              <Name>{_.get(user, 'name', 'Unknown')}</Name>
            </Item>
          )
        })}
      </List>
    )
  }
}