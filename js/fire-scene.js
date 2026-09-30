import { FIREPLACE_SCENE } from './fireplace-scene.js?v=7';

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

  const emberRegions = [
    { x: 620, y: 650, rx: 38, ry: 11, min: 0.01, max: 0.17, period: 5100, phase: 0.2 },
    { x: 680, y: 670, rx: 31, ry: 10, min: 0.01, max: 0.20, period: 6800, phase: 1.7 },
    { x: 735, y: 648, rx: 36, ry: 10, min: 0.01, max: 0.16, period: 5900, phase: 3.1 },
    { x: 790, y: 672, rx: 34, ry: 9, min: 0.01, max: 0.19, period: 7600, phase: 4.6 },
    { x: 845, y: 652, rx: 30, ry: 9, min: 0.01, max: 0.15, period: 6300, phase: 2.5 },
    { x: 720, y: 690, rx: 46, ry: 8, min: 0.01, max: 0.13, period: 8200, phase: 5.4 },
    { x: 815, y: 692, rx: 42, ry: 8, min: 0.01, max: 0.12, period: 7100, phase: 0.9 }
  ];

  const embers = emberRegions.map((region, index) => {
    const glow = new PIXI.Graphics();

    // A few overlapping small shapes avoid one obvious geometric oval.
    glow
      .ellipse(region.x, region.y, region.rx, region.ry)
      .fill({ color: 0xff4d0a, alpha: 1 })
      .ellipse(region.x - region.rx * 0.42, region.y + 2, region.rx * 0.45, region.ry * 0.65)
      .fill({ color: 0xff8a18, alpha: 0.72 })
      .ellipse(region.x + region.rx * 0.38, region.y - 1, region.rx * 0.38, region.ry * 0.55)
      .fill({ color: 0xffb12b, alpha: 0.55 });

    glow.alpha = region.min;
    glow.blendMode = 'add';
    glow.filters = [new PIXI.BlurFilter({ strength: 5 + (index % 2) * 2, quality: 1 })];
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
      const secondary = Math.sin((elapsed / (region.period * 1.73)) * Math.PI * 2 + region.phase * 1.9);
      const life = Math.max(0, Math.min(1, 0.5 + primary * 0.34 + secondary * 0.16));
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
