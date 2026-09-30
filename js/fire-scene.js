import { FIREPLACE_SCENE } from './fireplace-scene.js?v=9';

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

  // v9: animate the approved scene's own pixels, revealed only through
  // localized ember masks. No painted orange glow geometry is displayed.
  const emberRegions = [
    { x: 620, y: 650, rx: 44, ry: 15, min: 0.00, max: 0.58, period: 5200, phase: 0.2 },
    { x: 680, y: 670, rx: 38, ry: 14, min: 0.00, max: 0.64, period: 6900, phase: 1.7 },
    { x: 735, y: 648, rx: 42, ry: 14, min: 0.00, max: 0.56, period: 6000, phase: 3.1 },
    { x: 790, y: 672, rx: 40, ry: 13, min: 0.00, max: 0.62, period: 7700, phase: 4.6 },
    { x: 845, y: 652, rx: 36, ry: 13, min: 0.00, max: 0.54, period: 6400, phase: 2.5 },
    { x: 720, y: 690, rx: 52, ry: 12, min: 0.00, max: 0.48, period: 8300, phase: 5.4 },
    { x: 815, y: 692, rx: 48, ry: 12, min: 0.00, max: 0.46, period: 7200, phase: 0.9 }
  ];

  const embers = emberRegions.map((region, index) => {
    const pixelCopy = new PIXI.Sprite(texture);
    pixelCopy.blendMode = 'screen';

    const mask = new PIXI.Graphics()
      .ellipse(region.x, region.y, region.rx, region.ry)
      .fill({ color: 0xffffff, alpha: 1 })
      .ellipse(region.x - region.rx * 0.42, region.y + 2, region.rx * 0.48, region.ry * 0.70)
      .fill({ color: 0xffffff, alpha: 1 })
      .ellipse(region.x + region.rx * 0.38, region.y - 1, region.rx * 0.42, region.ry * 0.62)
      .fill({ color: 0xffffff, alpha: 1 });

    mask.filters = [new PIXI.BlurFilter({ strength: 7 + (index % 2) * 2, quality: 1 })];
    pixelCopy.mask = mask;
    pixelCopy.alpha = 0;

    emberLayer.addChild(mask);
    emberLayer.addChild(pixelCopy);

    return { pixelCopy, region };
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

    for (const { pixelCopy, region } of embers) {
      if (reduceMotion.matches) {
        pixelCopy.alpha = region.min;
        continue;
      }

      const primary = Math.sin((elapsed / region.period) * Math.PI * 2 + region.phase);
      const secondary = Math.sin((elapsed / (region.period * 1.67)) * Math.PI * 2 + region.phase * 1.83);
      const life = Math.max(0, Math.min(1, 0.5 + primary * 0.36 + secondary * 0.14));
      pixelCopy.alpha = region.min + (region.max - region.min) * life;
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
