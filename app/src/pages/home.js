import React from 'react'
import { history } from '../history'
import styled from 'styled-components'
import _ from 'lodash'

const Container = styled.div `
  padding: 30px;
  width: 100%;
`

const Form = styled.form `
  background: #FFF;
  padding: 10px;
  width: 300px;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  input{
    flex-grow: 1;
    border: 0 none;
    &:focus,&:active{
      outline: 0 none;
    }
  }
`

const Button = styled.button `
  margin-left: 10px;
  border: 0 none;
  padding: 7px 15px;
  &:focus,&:active{
      outline: 0 none;
  }
`

export default class Home extends React.Component {

  state = {
    name: ''
  }

  onSubmit (e) {

    e.preventDefault()

  }

  render () {
    return (
      <Container className={'home'}>
        <Form onSubmit={this.onSubmit}>
          <input
            autoComplete={'off'}
            autoCorrect={'off'}
            autoCapitalize={'off'}
            onChange={(e) => {

              this.setState({
                name: e.target.value,
              })
            }}
            placeholder={'Enter conversation to create or join...'}/>
          <Button onClick={() => {
            if (this.state.name) {
              const conversation = _.trim(this.state.name)
              history.push(`/${conversation}`)
            }

          }}>Go</Button>
        </Form>
      </Container>
    )
  }
}