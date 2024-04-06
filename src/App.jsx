import { Subscription } from './components/Subscription'

const ComponentInterface = {
  "username": "User",
  "should-display-mentions": false,
  "on-load" : () => {}
}

const App = () => <Subscription />

export { App, ComponentInterface }
