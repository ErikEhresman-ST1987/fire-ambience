import { FIREPLACE_SCENE } from './fireplace-scene.js?v=15';

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

  // v15: larger texture-derived ember regions.
  // Each region is a clipped duplicate of the approved scene itself, so the
  // animated material retains the photograph's real coal/log texture rather
  // than introducing geometric dots or lines.
  const regions = [
    { x: 575, y: 600, w: 105, h: 48, min: 0.10, max: 0.62, period: 5200, phase: 0.3 },
    { x: 645, y: 594, w: 115, h: 55, min: 0.08, max: 0.68, period: 6900, phase: 2.1 },
    { x: 720, y: 598, w: 120, h: 52, min: 0.09, max: 0.64, period: 5800, phase: 4.0 },
    { x: 795, y: 601, w: 110, h: 48, min: 0.08, max: 0.60, period: 7600, phase: 1.2 },
    { x: 615, y: 630, w: 130, h: 38, min: 0.06, max: 0.48, period: 8300, phase: 5.2 },
    { x: 735, y: 628, w: 145, h: 40, min: 0.06, max: 0.50, period: 7100, phase: 3.0 }
  ];

  const emberRegions = regions.map((region) => {
    const container = new PIXI.Container();

    const copy = new PIXI.Sprite(texture);
    copy.tint = 0xffd6a0;
    copy.alpha = region.min;

    const mask = new PIXI.Graphics()
      .roundRect(region.x, region.y, region.w, region.h, Math.min(16, region.h * 0.42))
      .fill(0xffffff);

    container.addChild(copy);
    container.addChild(mask);
    copy.mask = mask;
    emberLayer.addChild(container);

    return { copy, region };
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

    for (const { copy, region } of emberRegions) {
      if (reduceMotion.matches) {
        copy.alpha = region.min;
        copy.tint = 0xffb86b;
        continue;
      }

      const primary = Math.sin((elapsed / region.period) * Math.PI * 2 + region.phase);
      const secondary = Math.sin((elapsed / (region.period * 1.67)) * Math.PI * 2 + region.phase * 1.83);
      const life = Math.max(0, Math.min(1, 0.5 + primary * 0.36 + secondary * 0.14));

      // Warm the real source pixels as they brighten. The duplicated source
      // texture preserves coal/log detail; alpha supplies the visible heat rise.
      const g = Math.round(170 + 72 * life);
      const b = Math.round(70 + 145 * life);
      copy.tint = (255 << 16) | (g << 8) | b;
      copy.alpha = region.min + (region.max - region.min) * life;
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
