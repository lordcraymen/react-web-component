import { A11y } from '@react-three/a11y';

const getUrl = (url) =>  url && typeof url === "string" ? new URL(url, url.startsWith('#') && window.location.href).href : ""

const gotoUrl = (url) => {  { window.location.href = getUrl(url) }}

const Link = ({href="", alt="", onClick, onFocus = () => {} , tabIndex = 0, children}) => {

    const action = typeof onClick === "function" ? onClick : () => href && gotoUrl(href)

    return children ? 
        <A11y 
            role="link"
            focusCall={onFocus}
            tabIndex={tabIndex}
            description={alt}
            href={getUrl(href)}
        >
            <group onPointerUp={action}>{children}</group>
        </A11y> 
        : null
}

export { Link }