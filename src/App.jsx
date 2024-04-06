import styles from "./App.scss?inline"
import { Scene } from './components/Scene'

const ComponentInterface = {
  "onload" : ()=>{},
  "object-url": new URL("about:blank")
}

const App = () => (<><Scene /><style>{styles}</style></>)

export { App, ComponentInterface }
