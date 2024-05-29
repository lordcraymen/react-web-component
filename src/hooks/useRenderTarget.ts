import { useEffect, useRef } from 'react'
import { WebGLRenderTarget } from 'three'

const useRenderTarget = () => {
  const renderTarget = useRef(new WebGLRenderTarget(1,1)).current
  useEffect(() => () => { renderTarget.dispose() }, [renderTarget])
  return renderTarget
}

export { useRenderTarget }