export const FIREPLACE_SCENE = Object.freeze({
  id: 'fireplace-embers',
  image: 'assets/scenes/fireplace-embers.webp',
  width: 1536,
  height: 1024,
  focus: { x: 0.5, y: 0.56 },
  embers: [
    { x: 0.390, y: 0.590, rx: 0.050, ry: 0.018, min: 0.05, max: 0.16, speed: 0.00020, phase: 0.4 },
    { x: 0.438, y: 0.565, rx: 0.042, ry: 0.020, min: 0.04, max: 0.14, speed: 0.00016, phase: 2.1 },
    { x: 0.485, y: 0.595, rx: 0.055, ry: 0.020, min: 0.05, max: 0.17, speed: 0.00018, phase: 4.2 },
    { x: 0.536, y: 0.585, rx: 0.047, ry: 0.018, min: 0.04, max: 0.15, speed: 0.00014, phase: 1.2 },
    { x: 0.455, y: 0.620, rx: 0.075, ry: 0.016, min: 0.03, max: 0.11, speed: 0.00012, phase: 5.0 }
  ]
});
