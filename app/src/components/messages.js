import React from 'react'
import styled from 'styled-components'
import Message from './message'

const Container = styled.div `
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background: #FFF;
  height: ${props => props.containerHeight}px;
  position: relative;
  overflow: hidden;
  width: 100%;
  
`

const Inner = styled.div `
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  overflow: scroll;
  overflow-x: hidden;
  right:0;
  
`

class Messages extends React.Component {

  constructor (props) {
    super(props)

    this.scrollToBottom = this.scrollToBottom.bind(this)
    this.state = {
      windowHeight: window.innerHeight
    }
  }

  componentDidMount () {

    window.addEventListener('resize', this._resize.bind(this))
  }

  _resize () {

    this.setState({
      windowHeight: window.innerHeight
    })
  }

  getContainerHeight () {

    return this.state.windowHeight - (70 + 100)
  }

  componentDidUpdate (prevProps) {

    if (this.props.messages.length !== prevProps.messages.length && this.ref) {
      this.ref.scrollTop = this.ref.scrollHeight
    }
  }

  scrollToBottom () {
    if (this.ref) {
      this.ref.scrollIntoView({behavior: 'smooth'})
    }
  }

  render () {
    const {messages} = this.props
    const containerHeight = this.getContainerHeight()
    return (

      <Container containerHeight={containerHeight}>
        <Inner innerRef={ref => this.ref = ref}>
          {
            messages.map((message, index) => {
              return <Message message={message} key={index}/>
            })
          }
        </Inner>
      </Container>
    )
  }

}

export default Messages