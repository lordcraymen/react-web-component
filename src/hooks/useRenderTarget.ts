import { useEffect, useRef } from 'react'
import { WebGLRenderTarget } from 'three'

const useRenderTraget = () => {
  const renderTarget = useRef(new WebGLRenderTarget(0,0)).current
  useEffect(() => () => { renderTarget.dispose() }, [renderTarget])
  return renderTarget
}

export { useRenderTraget }