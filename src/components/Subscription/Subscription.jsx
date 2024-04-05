import styles from "./Subscription.scss?inline"
import { useHostContext } from "../useHostContext/useHostContext"
/*
const Test = ({USE, test}) => <div>{USE}{test}</div>

const TestWithHostContext = withHostContext(Test)
*/

const Subscription = () => {
  const username = useHostContext("username")
  const shouldDisplayMentions = useHostContext("should-display-mentions")
   return (<>   
      <style>{styles}</style>
      <div className="subscription">
        <h2 className="subscription__title">Subscription</h2>
        <p className="subscription__greeting">Hello {username} {test}!</p>
        <label htmlFor="email">
          <input
            id="email"
            type="email"
            className="subscription__input"
            placeholder="Enter your email"
          />
        </label>
        {shouldDisplayMentions === "true" && (
          <p className="subscription__mentions">
            My mention should be display here...
          </p>
        )}
      </div>
    </>)
}
  
  export { Subscription }