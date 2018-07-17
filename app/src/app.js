import React from 'react'
import { Router, Route, Switch } from 'react-router-dom'
import routes from './router'
import { history } from './history'

export default class App extends React.Component {

  render () {
    return (
      <div className={'app'}>
        <Router history={history}>
          <Switch>
            {
              routes.map((route, index) => {
                return (
                  <Route key={index} exact path={route.path} component={route.component}/>
                )
              })
            }

          </Switch>
        </Router>
      </div>
    )
  }
}