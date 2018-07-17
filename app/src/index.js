import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './app'
import './assets/css/index.css'

ReactDOM.render((
  <Provider store={store}>
    <App/>
  </Provider>
), document.getElementById('root'))
