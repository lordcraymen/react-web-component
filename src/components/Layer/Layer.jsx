import { useMemo } from 'react';
import { useThree, createPortal, useFrame } from '@react-three/fiber';
import { Scene, WebGL3DRenderTarget, AmbientLight, RGBAFormat } from 'three';
import { ScreenSpace, useFBO } from '@react-three/drei';


const Layer = ({ children }) => {

  const { scene: baseScene, size } = useThree()

  const [scene] = useMemo(() => {
    const scene = new Scene()
    scene.background = null;
    scene.add(new AmbientLight(0xffffff, 5))
    return [scene]
  }, [baseScene])

  const target = useFBO(size.width, size.height, { format: RGBAFormat })

  useFrame((state) => {
    state.gl.autoClear = true;
    state.gl.setRenderTarget(target)
    state.gl.render(scene, state.camera)
    state.gl.setRenderTarget(null)
  })

  return <>{createPortal(children, scene)}
      <mesh position={[0,0,0]}>
      <planeGeometry args={[size.width/100, size.height/100]} />
      <meshStandardMaterial map={target.texture} />
    </mesh>
  </>
}

export { Layer };