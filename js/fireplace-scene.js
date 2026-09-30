export const FIREPLACE_SCENE = Object.freeze({
  id: 'fireplace-embers',
  image: 'assets/scenes/fireplace-embers.webp',
  width: 1536,
  height: 1024,
  focus: { x: 0.5, y: 0.56 },
  embers: [
    { x: 0.408, y: 0.604, rx: 0.050, ry: 0.014, min: 0.08, max: 0.28, speed: 0.00024, phase: 0.4 },
    { x: 0.455, y: 0.586, rx: 0.045, ry: 0.016, min: 0.07, max: 0.25, speed: 0.00018, phase: 2.1 },
    { x: 0.500, y: 0.607, rx: 0.052, ry: 0.014, min: 0.08, max: 0.30, speed: 0.00021, phase: 4.2 },
    { x: 0.548, y: 0.596, rx: 0.044, ry: 0.014, min: 0.07, max: 0.24, speed: 0.00016, phase: 1.2 },
    { x: 0.476, y: 0.625, rx: 0.082, ry: 0.012, min: 0.06, max: 0.22, speed: 0.00014, phase: 5.0 }
  ]
});
