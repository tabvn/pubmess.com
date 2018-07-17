import { SET_USER } from '../types'
import uuid from 'uuid/v4'

export const setUser = (user = null) => {

  return (dispatch, getState, {service, pubSub}) => {

    localStorage.setItem('app_user', user ? JSON.stringify(user) : '')

    if (user === null) {
      const id = uuid()
      user = {
        _id: id,
        name: 'Unknown',
        avatar: `https://api.adorable.io/avatars/50/${id}.png`
      }
    }
    if (user && !user._id) {
      user._id = uuid()
    }
    dispatch({
      type: SET_USER,
      payload: user,
    })

    pubSub.setUser(user)


  }
}
