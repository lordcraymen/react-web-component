import { useRef } from 'react';
import { invalidate } from '@react-three/fiber';

const Pan = ({children, speed = 0.001}) => {

    const panRef = useRef();

    const onPointerDown = (event) => {
        if(!event.ctrlKey) return
        event.stopPropagation();
        const pointerStart = { x: event.clientX, y: event.clientY };

        const onPointerMove = (event) => {
            const pointerDelta = { x: event.clientX - pointerStart.x, y: event.clientY - pointerStart.y };
            console.log(pointerDelta)
            panRef.current.position.x = pointerDelta.x * -speed;
            panRef.current.position.y = pointerDelta.y * speed;
            invalidate();
        };
        const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    }

    return (
        <group ref={panRef} {...{ onPointerDown }}>
            {children}
        </group>
    );
}

export {Pan};