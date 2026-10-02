export const FIRE_SCENES = Object.freeze({
  fireplace: Object.freeze({
    id: 'fireplace',
    label: 'Fireplace',
    image: 'assets/scenes/fireplace-embers.webp',
    width: 1536,
    height: 1024,
    focus: { x: 0.5, y: 0.56 },
    embers: [
      { x: 592, y: 626, rx: 31, ry: 14, peak: 0.92, period: 6100, phase: 0.4 },
      { x: 630, y: 638, rx: 27, ry: 13, peak: 1.00, period: 7900, phase: 2.8 },
      { x: 665, y: 624, rx: 30, ry: 15, peak: 0.87, period: 5400, phase: 4.6 },
      { x: 700, y: 642, rx: 32, ry: 13, peak: 0.96, period: 8800, phase: 1.5 },
      { x: 739, y: 625, rx: 29, ry: 15, peak: 0.90, period: 6700, phase: 5.5 },
      { x: 775, y: 641, rx: 31, ry: 13, peak: 1.00, period: 9300, phase: 3.3 },
      { x: 813, y: 624, rx: 28, ry: 14, peak: 0.85, period: 7200, phase: 0.9 },
      { x: 849, y: 639, rx: 27, ry: 12, peak: 0.95, period: 8200, phase: 4.1 },
      { x: 612, y: 655, rx: 26, ry: 10, peak: 0.88, period: 7600, phase: 5.9 },
      { x: 651, y: 659, rx: 30, ry: 10, peak: 0.97, period: 9800, phase: 1.9 },
      { x: 692, y: 657, rx: 28, ry: 10, peak: 0.84, period: 6900, phase: 3.7 },
      { x: 733, y: 661, rx: 31, ry: 10, peak: 0.93, period: 8500, phase: 0.2 },
      { x: 777, y: 657, rx: 29, ry: 10, peak: 0.89, period: 10300, phase: 4.9 },
      { x: 820, y: 654, rx: 28, ry: 10, peak: 0.98, period: 7400, phase: 2.4 },
      { x: 626, y: 604, rx: 20, ry: 11, peak: 0.86, period: 8700, phase: 3.0 },
      { x: 675, y: 596, rx: 18, ry: 10, peak: 0.94, period: 6400, phase: 5.1 },
      { x: 718, y: 607, rx: 22, ry: 11, peak: 0.88, period: 9600, phase: 1.1 },
      { x: 763, y: 596, rx: 19, ry: 10, peak: 1.00, period: 7100, phase: 4.4 },
      { x: 805, y: 607, rx: 21, ry: 11, peak: 0.85, period: 9000, phase: 2.0 },
      { x: 842, y: 600, rx: 18, ry: 10, peak: 0.92, period: 6800, phase: 5.8 }
    ],
    flames: [
      { x: 648, y: 622, w: 27, h: 48, period: 6900, phase: 0.5, max: 0.68, lean: -0.045 },
      { x: 704, y: 615, w: 31, h: 57, period: 8400, phase: 2.7, max: 0.76, lean: 0.035 },
      { x: 765, y: 620, w: 25, h: 44, period: 7600, phase: 4.8, max: 0.62, lean: -0.030 },
      { x: 821, y: 617, w: 29, h: 52, period: 9300, phase: 1.6, max: 0.70, lean: 0.040 }
    ]
  }),
  campfire: Object.freeze({
    id: 'campfire',
    label: 'Campfire',
    image: 'assets/scenes/campfire.webp',
    width: 1448,
    height: 1086,
    focus: { x: 0.5, y: 0.58 },
    embers: [
      { x: 650, y: 792, rx: 26, ry: 12, peak: 0.88, period: 7200, phase: 0.5 },
      { x: 681, y: 803, rx: 28, ry: 12, peak: 0.96, period: 9100, phase: 2.4 },
      { x: 714, y: 790, rx: 27, ry: 13, peak: 0.90, period: 6500, phase: 4.8 },
      { x: 747, y: 805, rx: 29, ry: 12, peak: 1.00, period: 9800, phase: 1.3 },
      { x: 781, y: 791, rx: 27, ry: 13, peak: 0.87, period: 7600, phase: 5.4 },
      { x: 812, y: 804, rx: 25, ry: 11, peak: 0.94, period: 8600, phase: 3.1 },
      { x: 667, y: 821, rx: 25, ry: 10, peak: 0.91, period: 8100, phase: 5.9 },
      { x: 701, y: 826, rx: 28, ry: 10, peak: 0.98, period: 10400, phase: 1.8 },
      { x: 738, y: 823, rx: 27, ry: 10, peak: 0.86, period: 7000, phase: 3.8 },
      { x: 775, y: 827, rx: 28, ry: 10, peak: 0.95, period: 8900, phase: 0.2 },
      { x: 804, y: 819, rx: 23, ry: 10, peak: 0.89, period: 9500, phase: 4.6 },
      { x: 688, y: 774, rx: 18, ry: 10, peak: 0.88, period: 8700, phase: 2.9 },
      { x: 727, y: 770, rx: 20, ry: 11, peak: 0.97, period: 6800, phase: 5.0 },
      { x: 766, y: 775, rx: 19, ry: 10, peak: 0.90, period: 9200, phase: 1.0 },

      // Small ember pockets carried into the log area.
      { x: 700, y: 751, rx: 15, ry: 8, peak: 0.84, period: 7900, phase: 3.6 },
      { x: 735, y: 744, rx: 16, ry: 8, peak: 0.91, period: 10100, phase: 0.8 },
      { x: 770, y: 752, rx: 14, ry: 8, peak: 0.86, period: 7300, phase: 5.6 },
      { x: 748, y: 765, rx: 13, ry: 7, peak: 0.89, period: 8800, phase: 2.2 }
    ],
    flames: [
      { x: 681, y: 795, w: 25, h: 46, period: 7200, phase: 0.7, max: 0.64, lean: -0.045 },
      { x: 724, y: 786, w: 29, h: 55, period: 8600, phase: 2.8, max: 0.74, lean: 0.030 },
      { x: 767, y: 792, w: 24, h: 43, period: 7800, phase: 4.9, max: 0.61, lean: -0.025 },
      { x: 803, y: 797, w: 25, h: 47, period: 9400, phase: 1.7, max: 0.66, lean: 0.035 }
    ]
  }),
  woodstove: Object.freeze({
    id: 'woodstove',
    label: 'Wood Stove',
    image: 'assets/scenes/wood-stove.webp',
    width: 1448,
    height: 1086,
    focus: { x: 0.5, y: 0.56 },
    embers: [
      { x: 847, y: 558, rx: 22, ry: 10, peak: 0.88, period: 7200, phase: 0.4 },
      { x: 876, y: 566, rx: 25, ry: 11, peak: 0.96, period: 9100, phase: 2.5 },
      { x: 907, y: 556, rx: 25, ry: 11, peak: 0.91, period: 6500, phase: 4.7 },
      { x: 938, y: 568, rx: 26, ry: 11, peak: 1.00, period: 9800, phase: 1.4 },
      { x: 969, y: 556, rx: 25, ry: 11, peak: 0.89, period: 7600, phase: 5.3 },
      { x: 998, y: 565, rx: 22, ry: 10, peak: 0.95, period: 8600, phase: 3.2 },
      { x: 860, y: 578, rx: 21, ry: 8, peak: 0.90, period: 8100, phase: 5.8 },
      { x: 891, y: 582, rx: 23, ry: 8, peak: 0.98, period: 10400, phase: 1.9 },
      { x: 925, y: 580, rx: 23, ry: 8, peak: 0.87, period: 7000, phase: 3.9 },
      { x: 958, y: 582, rx: 23, ry: 8, peak: 0.95, period: 8900, phase: 0.3 },
      { x: 989, y: 576, rx: 20, ry: 8, peak: 0.89, period: 9500, phase: 4.5 },
      { x: 878, y: 542, rx: 14, ry: 8, peak: 0.86, period: 8700, phase: 2.8 },
      { x: 913, y: 538, rx: 16, ry: 9, peak: 0.95, period: 6800, phase: 5.1 },
      { x: 949, y: 543, rx: 15, ry: 8, peak: 0.89, period: 9200, phase: 1.1 },
      { x: 983, y: 541, rx: 14, ry: 7, peak: 0.84, period: 7900, phase: 3.5 }
    ],
    flames: [
      { x: 873, y: 565, w: 22, h: 42, period: 7200, phase: 0.6, max: 0.63, lean: -0.040 },
      { x: 912, y: 558, w: 26, h: 50, period: 8600, phase: 2.9, max: 0.73, lean: 0.030 },
      { x: 951, y: 563, w: 21, h: 39, period: 7800, phase: 4.8, max: 0.60, lean: -0.025 },
      { x: 985, y: 566, w: 23, h: 43, period: 9400, phase: 1.8, max: 0.65, lean: 0.035 }
    ],
    ambientLights: [
      { x: 348, y: 349, rx: 70, ry: 72, min: 0.05, max: 0.16, period: 9400, phase: 0.7 },
      { x: 1019, y: 362, rx: 40, ry: 56, min: 0.04, max: 0.13, period: 11100, phase: 3.1 },
      { x: 1105, y: 381, rx: 34, ry: 50, min: 0.04, max: 0.12, period: 8700, phase: 5.0 }
    ]
  })
});

export function getFireScene(id) {
  return FIRE_SCENES[id] || FIRE_SCENES.fireplace;
}
