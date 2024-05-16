import { useRef, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from 'three';

const Rotator = ({ children, active }) => {
    const group = useRef();
    const { gl } = useThree();
    const rotator = useMemo(() => new OrbitControls(group.current || new PerspectiveCamera(), gl.domElement.parentElement.parentElement), [group.current, gl.domElement]);

    useFrame(() => { rotator.update() });
    return <perspectiveCamera ref={group}>{children}</perspectiveCamera>;
}

export { Rotator }