import thunk from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import reducers from './redux/reducers'
import PubSub from './pubsub'
import { websocketUrl } from './config'
import Service from './services'
import { setUser } from './redux/actions/app'

const pubSub = new PubSub(websocketUrl)
const service = new Service()
export const store = createStore(
  reducers,
  applyMiddleware(thunk.withExtraArgument({service, pubSub})),
)

const userFromStorage = localStorage.getItem('app_user')
let user = null
if (userFromStorage) {
  try {
    user = JSON.parse(userFromStorage)
  }
  catch (e) {

  }
}

store.dispatch(setUser(user))