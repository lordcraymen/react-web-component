import { useEffect, useMemo } from 'react'
import { DepthTexture, WebGLRenderTarget } from 'three'

type TargetProps = {
  mode: "2D" | "3D"
}

const useRenderTarget = ({mode}:TargetProps) => {
  const renderTarget = useMemo(() => {
    const renderTarget = new WebGLRenderTarget(1, 1)
    if (mode === "3D") {
      renderTarget.depthBuffer = true
      renderTarget.depthTexture = new DepthTexture(1,1)
    }
    return renderTarget
  }, [mode])
  useEffect(() => () => { renderTarget.dispose() }, [renderTarget])
  return renderTarget
}

export { useRenderTarget }