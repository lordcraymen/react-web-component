const clamp = (value = 0, min = 0, max = Infinity) =>  Math.min(Math.max(Number(value), min), max);
export { clamp }
