import { MeshBasicMaterial } from "three";

const SkipRenderMaterial = new MeshBasicMaterial({
    color: 0x000000,
    transparent: false,
    opacity: 1,
    depthWrite: false,
    depthTest: false,
    visible: true,
    });

export { SkipRenderMaterial };
