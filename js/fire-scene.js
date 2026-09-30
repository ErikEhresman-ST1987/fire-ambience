import { FIREPLACE_SCENE } from './fireplace-scene.js?v=11';

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

  world.addChild(background);
  world.addChild(emberLayer);
  app.stage.addChild(world);

  // v11: first natural treatment on the verified basic Graphics + alpha path.
  // Coordinates are corrected upward from the v10 hearth diagnostic into
  // the visible coal/ember bed. No filters, masks, blend modes, or shaders.
  const emberRegions = [
    { x: 610, y: 628, rx: 20, ry: 6, color: 0xff5a12, min: 0.02, max: 0.30, period: 4200, phase: 0.2 },
    { x: 650, y: 615, rx: 18, ry: 6, color: 0xff7a18, min: 0.02, max: 0.34, period: 5600, phase: 1.6 },
    { x: 690, y: 631, rx: 22, ry: 6, color: 0xff4d0a, min: 0.02, max: 0.28, period: 4800, phase: 3.0 },
    { x: 730, y: 620, rx: 19, ry: 5, color: 0xff8a20, min: 0.02, max: 0.32, period: 6500, phase: 4.4 },
    { x: 770, y: 632, rx: 21, ry: 6, color: 0xff5610, min: 0.02, max: 0.30, period: 5300, phase: 2.3 },
    { x: 810, y: 617, rx: 18, ry: 5, color: 0xff7618, min: 0.02, max: 0.27, period: 7100, phase: 5.1 },
    { x: 850, y: 629, rx: 19, ry: 5, color: 0xff4f0c, min: 0.02, max: 0.25, period: 6000, phase: 0.9 }
  ];

  const embers = emberRegions.map((region) => {
    const glow = new PIXI.Graphics()
      .ellipse(region.x, region.y, region.rx, region.ry)
      .fill(region.color);

    glow.alpha = region.min;
    emberLayer.addChild(glow);
    return { glow, region };
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

    for (const { glow, region } of embers) {
      if (reduceMotion.matches) {
        glow.alpha = region.min;
        continue;
      }

      const primary = Math.sin((elapsed / region.period) * Math.PI * 2 + region.phase);
      const secondary = Math.sin((elapsed / (region.period * 1.71)) * Math.PI * 2 + region.phase * 1.8);
      const life = Math.max(0, Math.min(1, 0.5 + primary * 0.36 + secondary * 0.14));
      glow.alpha = region.min + (region.max - region.min) * life;
    }
  });

  return {
    app,
    destroy() {
      resizeObserver.disconnect();
      window.removeEventListener('orientationchange', compose);
      app.destroy(true, { children: true });
    }
  };
}
