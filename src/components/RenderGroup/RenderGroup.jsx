import { useCallback } from "react"
import { Mesh } from "three"

const RenderGroup = ({children}) => {

    let el = undefined
    const onMount = useCallback((element) => {
        if(!element) { console.log("unmounting",el); return}
        el = element
        console.log("mounting",el.onBeforeRender)
        el.onBeforeRender = () => { console.log("rendering")}
    },[])

    return <mesh ref={onMount}>{children}</mesh>

}
export { RenderGroup }