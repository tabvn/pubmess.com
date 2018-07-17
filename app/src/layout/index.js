import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div `
  font-size: 13px;
  color: #3c434c;
`
export default class Layout extends React.Component {

  render () {
    return (
      <Wrapper className={'app'}>
        {this.props.children}
      </Wrapper>
    )
  }
}