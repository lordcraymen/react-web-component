const prefersreducedMotion = () => !!window?.matchMedia('(prefers-reduced-motion: reduce)').matches
export { prefersreducedMotion }
