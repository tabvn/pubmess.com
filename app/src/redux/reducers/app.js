import { SET_TOKEN, SET_USER } from '../types'

const initState = {
  token: null,
  user: null
}

export default (state = initState, action) => {

  switch (action.type) {

    case SET_USER:

      return {
        ...state,
        user: action.payload,
      }

    case SET_TOKEN:

      return {
        ...state,
        token: action.payload,

      }
    default:

      return state
  }
}