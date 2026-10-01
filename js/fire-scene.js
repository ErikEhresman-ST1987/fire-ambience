import { FIREPLACE_SCENE } from './fireplace-scene.js?v=20';

export async function createFireScene(host) {
  const PIXI = window.PIXI;
  if (!PIXI) throw new Error('PixiJS runtime was not loaded.');

  const app = new PIXI.Application();
  await app.init({
    background: '#000000',
    antialias: true,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoStart: true
  });
  host.appendChild(app.canvas);

  const texture = await PIXI.Assets.load(FIREPLACE_SCENE.image);
  const world = new PIXI.Container();
  const background = new PIXI.Sprite(texture);
  const emberLayer = new PIXI.Container();
  const flameLayer = new PIXI.Container();

  world.addChild(background);
  world.addChild(emberLayer);
  world.addChild(flameLayer);
  app.stage.addChild(world);

  // v18: preserve v17's proven ColorMatrix heat range, but distribute it
  // through smaller irregular regions where glowing material makes sense.
  // peak varies modestly so neighboring embers do not all reach the same heat.
  const regions = [
    // Coal bed beneath the logs.
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

    // Smaller pockets visible between and immediately around the logs.
    { x: 626, y: 604, rx: 20, ry: 11, peak: 0.86, period: 8700, phase: 3.0 },
    { x: 675, y: 596, rx: 18, ry: 10, peak: 0.94, period: 6400, phase: 5.1 },
    { x: 718, y: 607, rx: 22, ry: 11, peak: 0.88, period: 9600, phase: 1.1 },
    { x: 763, y: 596, rx: 19, ry: 10, peak: 1.00, period: 7100, phase: 4.4 },
    { x: 805, y: 607, rx: 21, ry: 11, peak: 0.85, period: 9000, phase: 2.0 },
    { x: 842, y: 600, rx: 18, ry: 10, peak: 0.92, period: 6800, phase: 5.8 }
  ];

  const emberRegions = regions.map((region) => {
    const container = new PIXI.Container();
    const copy = new PIXI.Sprite(texture);
    const color = new PIXI.ColorMatrixFilter();

    // Elliptical masks are deliberately small and overlap in places. Because
    // they reveal transformed source pixels rather than painted shapes, the
    // source coal/log texture remains the visible detail.
    const mask = new PIXI.Graphics()
      .ellipse(region.x, region.y, region.rx, region.ry)
      .fill(0xffffff);

    copy.mask = mask;
    copy.filters = [color];

    container.addChild(copy);
    container.addChild(mask);
    emberLayer.addChild(container);

    return { copy, color, region };
  });

  // v19: restrained low-flame proof. This is intentionally a separate
  // layer so the approved v18 ember treatment remains untouched.
  const flameDefs = [
    { x: 648, y: 622, w: 27, h: 48, period: 6900, phase: 0.5, max: 0.68, lean: -0.045 },
    { x: 704, y: 615, w: 31, h: 57, period: 8400, phase: 2.7, max: 0.76, lean: 0.035 },
    { x: 765, y: 620, w: 25, h: 44, period: 7600, phase: 4.8, max: 0.62, lean: -0.030 },
    { x: 821, y: 617, w: 29, h: 52, period: 9300, phase: 1.6, max: 0.70, lean: 0.040 }
  ];

  const flameGradients = [];
  const flames = flameDefs.map((def) => {
    const holder = new PIXI.Container();
    holder.position.set(def.x, def.y);

    const outerGradient = new PIXI.FillGradient({
      type: 'linear',
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
      textureSpace: 'local',
      colorStops: [
        { offset: 0, color: '#ffd36a' },
        { offset: 0.48, color: '#ff8a2b' },
        { offset: 1, color: '#d94718' }
      ]
    });
    const innerGradient = new PIXI.FillGradient({
      type: 'linear',
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
      textureSpace: 'local',
      colorStops: [
        { offset: 0, color: '#fff3b0' },
        { offset: 0.58, color: '#ffc247' },
        { offset: 1, color: '#ff6b1f' }
      ]
    });
    flameGradients.push(outerGradient, innerGradient);

    const outer = new PIXI.Graphics()
      .moveTo(-def.w * 0.48, 0)
      .bezierCurveTo(-def.w * 0.58, -def.h * 0.28, -def.w * 0.20, -def.h * 0.66, 0, -def.h)
      .bezierCurveTo(def.w * 0.12, -def.h * 0.70, def.w * 0.60, -def.h * 0.30, def.w * 0.48, 0)
      .closePath()
      .fill(outerGradient);

    const inner = new PIXI.Graphics()
      .moveTo(-def.w * 0.25, -1)
      .bezierCurveTo(-def.w * 0.28, -def.h * 0.22, -def.w * 0.08, -def.h * 0.46, 0, -def.h * 0.67)
      .bezierCurveTo(def.w * 0.10, -def.h * 0.45, def.w * 0.30, -def.h * 0.20, def.w * 0.25, -1)
      .closePath()
      .fill(innerGradient);

    // A very small blur softens vector edges without turning the proof into
    // a filter-heavy flame system.
    outer.filters = [new PIXI.BlurFilter({ strength: 1.2, quality: 2 })];
    inner.filters = [new PIXI.BlurFilter({ strength: 0.7, quality: 1 })];
    holder.blendMode = 'screen';
    holder.addChild(outer, inner);
    flameLayer.addChild(holder);

    return { holder, def };
  });

  function compose() {
    const rect = host.getBoundingClientRect();
    const viewW = Math.max(1, rect.width);
    const viewH = Math.max(1, rect.height);
    app.renderer.resize(viewW, viewH);

    const scale = Math.max(
      viewW / FIREPLACE_SCENE.width,
      viewH / FIREPLACE_SCENE.height
    );
    world.scale.set(scale);

    const scaledW = FIREPLACE_SCENE.width * scale;
    const scaledH = FIREPLACE_SCENE.height * scale;
    world.x = (viewW - scaledW) * FIREPLACE_SCENE.focus.x;
    world.y = (viewH - scaledH) * FIREPLACE_SCENE.focus.y;
  }

  compose();

  const resizeObserver = new ResizeObserver(compose);
  resizeObserver.observe(host);
  window.addEventListener('orientationchange', compose, { passive: true });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let elapsed = 0;

  app.ticker.add((ticker) => {
    elapsed += ticker.deltaMS;

    for (const { copy, color, region } of emberRegions) {
      if (reduceMotion.matches) {
        copy.alpha = 0;
        continue;
      }

      const primary = Math.sin((elapsed / region.period) * Math.PI * 2 + region.phase);
      const secondary = Math.sin((elapsed / (region.period * 1.71)) * Math.PI * 2 + region.phase * 1.91);
      const life = Math.max(0, Math.min(1, 0.5 + primary * 0.34 + secondary * 0.16));
      const heat = life * region.peak;

      // Keep very close to v17's successful perceived range. Region-specific
      // peak values vary only the upper end, so the hottest point wanders
      // naturally instead of every patch reaching the same maximum.
      color.reset();
      color.brightness(1.15 + heat * 2.85, false);
      color.contrast(1.0 + heat * 0.35, true);
      copy.alpha = 0.18 + heat * 0.82;
    }

    for (const { holder, def } of flames) {
      if (reduceMotion.matches) {
        holder.alpha = 0;
        continue;
      }

      // Two slow cycles create irregular rise/recede behavior. The threshold
      // gives each flame genuine quiet periods instead of a constant pulse.
      const primary = Math.sin((elapsed / def.period) * Math.PI * 2 + def.phase);
      const secondary = Math.sin((elapsed / (def.period * 0.61)) * Math.PI * 2 + def.phase * 1.73);
      const raw = 0.5 + primary * 0.34 + secondary * 0.16;
      const life = Math.max(0, Math.min(1, (raw - 0.31) / 0.69));

      holder.alpha = life * def.max;
      holder.scale.set(0.88 + life * 0.14, 0.72 + life * 0.32);
      holder.rotation = def.lean + Math.sin((elapsed / (def.period * 0.43)) * Math.PI * 2 + def.phase) * 0.035;
      holder.x = def.x + Math.sin((elapsed / (def.period * 0.37)) * Math.PI * 2 + def.phase * 0.7) * 2.2;
    }
  });

  return {
    app,
    destroy() {
      resizeObserver.disconnect();
      window.removeEventListener('orientationchange', compose);
      for (const gradient of flameGradients) gradient.destroy();
      app.destroy(true, { children: true });
    }
  };
}
