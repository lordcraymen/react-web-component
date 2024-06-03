import { useCallback, useMemo } from "react"
import { Mesh, Scene, MeshBasicMaterial, WebGLRenderTarget, RGBAFormat } from "three"



const RenderGroup = ({children,opacity=1}) => {
    
    const {tempScene,tempTarget} = useMemo(()=> ({   tempScene: new Scene(), tempTarget: new WebGLRenderTarget( 1, 1, { format: RGBAFormat })}),[])

    const onBeforeRender = useCallback((gl,scene,camera,element) => {
        //console.log(gl,scene,camera)
        tempTarget.setSize( gl.domElement.width, gl.domElement.height );
        gl.setRenderTarget(tempTarget);
        const tmpParent = element.parent
        tempScene.attach(element)
        tempScene.overrideMaterial = new MeshBasicMaterial({color: 0xff00ff});
        gl.render(tempScene, camera);
        gl.setRenderTarget(null);
        parent.attach(element);

    },[])

    

    return <mesh {...{onBeforeRender}}>{children}</mesh>

}
export { RenderGroup }