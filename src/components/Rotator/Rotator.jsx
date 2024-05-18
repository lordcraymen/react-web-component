import {
    useRef,
    useMemo,
    useEffect
} from 'react';
import {
    Group
} from 'three';
import {
    useThree,
    useFrame
} from '@react-three/fiber';

const Rotator = ({
    children
}) => {
    const meshRef = useRef(new Group());
    const { gl } = useThree();
    const domElement = gl && gl.domElement;
    console.log(domElement)

    useEffect(() => {
        if (domElement) {
            const listener = domElement.addEventListener("pointermove",(event) => {
                console.log(event)
            })
            console.log('listener', listener)
            return () => {
                domElement.removeEventListener(listener);
            }
        }
    }, [domElement]);

    return ( <
        group ref = {
            meshRef
        } > {
            children
        } <
        /group>
    );
}

export {
    Rotator
};