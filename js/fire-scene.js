import { FIREPLACE_SCENE } from './fireplace-scene.js?v=8';

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
  const livingLightLayer = new PIXI.Container();

  world.addChild(background);
  world.addChild(livingLightLayer);
  app.stage.addChild(world);

  const emberRegions = [
    { x: 620, y: 650, rx: 40, ry: 12, min: 0.02, max: 0.38, period: 5100, phase: 0.2 },
    { x: 680, y: 670, rx: 33, ry: 11, min: 0.02, max: 0.43, period: 6800, phase: 1.7 },
    { x: 735, y: 648, rx: 38, ry: 11, min: 0.02, max: 0.36, period: 5900, phase: 3.1 },
    { x: 790, y: 672, rx: 36, ry: 10, min: 0.02, max: 0.41, period: 7600, phase: 4.6 },
    { x: 845, y: 652, rx: 32, ry: 10, min: 0.02, max: 0.34, period: 6300, phase: 2.5 },
    { x: 720, y: 690, rx: 48, ry: 9, min: 0.01, max: 0.29, period: 8200, phase: 5.4 },
    { x: 815, y: 692, rx: 44, ry: 9, min: 0.01, max: 0.27, period: 7100, phase: 0.9 }
  ];

  const embers = emberRegions.map((region, index) => {
    const glow = new PIXI.Graphics()
      .ellipse(region.x, region.y, region.rx, region.ry)
      .fill({ color: 0xff4d0a, alpha: 1 })
      .ellipse(region.x - region.rx * 0.42, region.y + 2, region.rx * 0.45, region.ry * 0.65)
      .fill({ color: 0xff8a18, alpha: 0.78 })
      .ellipse(region.x + region.rx * 0.38, region.y - 1, region.rx * 0.38, region.ry * 0.55)
      .fill({ color: 0xffc03a, alpha: 0.62 });

    glow.alpha = region.min;
    glow.blendMode = 'add';
    glow.filters = [new PIXI.BlurFilter({ strength: 5 + (index % 2) * 2, quality: 1 })];
    livingLightLayer.addChild(glow);
    return { glow, region };
  });

  // Existing candle/light sources in the approved artwork.
  // Coordinates are in the canonical 1536x1024 scene.
  const candleRegions = [
    { x: 443, y: 146, rx: 18, ry: 30, min: 0.015, max: 0.115, period: 3900, phase: 0.6 },
    { x: 500, y: 183, rx: 18, ry: 28, min: 0.012, max: 0.095, period: 4700, phase: 2.4 },
    { x: 77,  y: 811, rx: 31, ry: 38, min: 0.010, max: 0.080, period: 4300, phase: 4.1 }
  ];

  const candles = candleRegions.map((region) => {
    const glow = new PIXI.Graphics()
      .ellipse(region.x, region.y, region.rx, region.ry)
      .fill({ color: 0xffb347, alpha: 1 });

    glow.alpha = region.min;
    glow.blendMode = 'add';
    glow.filters = [new PIXI.BlurFilter({ strength: 15, quality: 1 })];
    livingLightLayer.addChild(glow);
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
      const secondary = Math.sin((elapsed / (region.period * 1.73)) * Math.PI * 2 + region.phase * 1.9);
      const life = Math.max(0, Math.min(1, 0.5 + primary * 0.34 + secondary * 0.16));
      glow.alpha = region.min + (region.max - region.min) * life;
    }

    for (const { glow, region } of candles) {
      if (reduceMotion.matches) {
        glow.alpha = region.min;
        continue;
      }

      const slow = Math.sin((elapsed / region.period) * Math.PI * 2 + region.phase);
      const drift = Math.sin((elapsed / (region.period * 0.61)) * Math.PI * 2 + region.phase * 2.2);
      const life = Math.max(0, Math.min(1, 0.5 + slow * 0.32 + drift * 0.12));
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
