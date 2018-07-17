import Home from './pages/home'
import Channel from './pages/channel'
import NotFound from './pages/notfound'

export default [
  {
    path: '/',
    title: '',
    component: Home
  },
  {
    path: '/:id',
    title: '',
    component: Channel
  },
  {
    path: '**',
    title: '',
    component: NotFound
  }

]