import { useMemo } from 'react';
import { useThree, createPortal, useFrame } from '@react-three/fiber';
import { Scene, WebGL3DRenderTarget, AmbientLight } from 'three';
import { ScreenSpace, useFBO } from '@react-three/drei';


const Layer = ({ children }) => {

  const { scene: baseScene, size } = useThree()

  const [scene] = useMemo(() => {
    const scene = new Scene()
    scene.add(new AmbientLight(0xffffff, 0.5))
    return [scene]
  }, [baseScene])

  const target = useFBO({ stencilBuffer: true })

  useFrame((state) => {
    state.gl.setRenderTarget(target)
    state.gl.render(scene, state.camera)
    state.gl.setRenderTarget(null)
  })

  return <>{createPortal(children, scene)}
      <mesh>
        <boxGeometry args={[2, 2, 2]}>
            <meshStandardMaterial color={'orange'} />
        </boxGeometry>
      </mesh>
  </>
}

export { Layer };