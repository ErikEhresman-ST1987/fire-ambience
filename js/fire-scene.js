import { FIREPLACE_SCENE } from './fireplace-scene.js?v=14';

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

  // v14: natural-color proof derived from the verified v13 perceptual threshold.
  // Ember marks retain strong luminance change while shifting from red-orange through amber to near-white hot.
  // No filters, masks, blend modes, shaders, or post-processing.
  const emberRegions = [
    { x: 602, y: 626, w: 18, h: 4, color: 0xffffff, min: 0.82, max: 1.00, period: 3600, phase: 0.2 },
    { x: 628, y: 633, w: 10, h: 5, color: 0xffffff, min: 0.82, max: 1.00, period: 5100, phase: 2.0 },
    { x: 654, y: 615, w: 16, h: 4, color: 0xffffff, min: 0.82, max: 1.00, period: 4300, phase: 1.1 },
    { x: 681, y: 630, w: 12, h: 5, color: 0xffffff, min: 0.82, max: 1.00, period: 5900, phase: 3.6 },
    { x: 710, y: 623, w: 20, h: 4, color: 0xffffff, min: 0.82, max: 1.00, period: 4700, phase: 4.8 },
    { x: 741, y: 633, w: 11, h: 5, color: 0xffffff, min: 0.82, max: 1.00, period: 6500, phase: 2.7 },
    { x: 769, y: 619, w: 17, h: 4, color: 0xffffff, min: 0.82, max: 1.00, period: 5400, phase: 5.4 },
    { x: 799, y: 631, w: 13, h: 5, color: 0xffffff, min: 0.82, max: 1.00, period: 7000, phase: 0.8 },
    { x: 828, y: 620, w: 18, h: 4, color: 0xffffff, min: 0.82, max: 1.00, period: 4900, phase: 3.2 },
    { x: 853, y: 629, w: 10, h: 5, color: 0xffffff, min: 0.82, max: 1.00, period: 6200, phase: 1.7 }
  ];

  const embers = emberRegions.map((region, index) => {
    const ember = new PIXI.Graphics();

    if (index % 3 === 0) {
      ember
        .moveTo(region.x - region.w, region.y + 1)
        .lineTo(region.x - region.w * 0.35, region.y - region.h)
        .lineTo(region.x + region.w * 0.30, region.y + region.h * 0.25)
        .lineTo(region.x + region.w, region.y - 1)
        .stroke({ color: region.color, width: 3 });
    } else {
      ember
        .ellipse(region.x, region.y, region.w * 0.42, region.h)
        .fill(region.color);
    }

    ember.alpha = 1;
    emberLayer.addChild(ember);
    return { ember, region };
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

    for (const { ember, region } of embers) {
      if (reduceMotion.matches) {
        ember.tint = 0xff6a18;
        ember.alpha = 0.82;
        continue;
      }

      const primary = Math.sin((elapsed / region.period) * Math.PI * 2 + region.phase);
      const secondary = Math.sin((elapsed / (region.period * 1.63)) * Math.PI * 2 + region.phase * 1.77);
      const life = Math.max(0, Math.min(1, 0.5 + primary * 0.38 + secondary * 0.12));
      // Preserve visibility by changing emitted-looking color/luminance more than transparency.
      // Low: red-orange coal. Mid: amber/yellow. High: near-white hot.
      let r;
      let g;
      let b;
      if (life < 0.58) {
        const t = life / 0.58;
        r = 255;
        g = Math.round(82 + (184 - 82) * t);
        b = Math.round(18 + (42 - 18) * t);
      } else {
        const t = (life - 0.58) / 0.42;
        r = 255;
        g = Math.round(184 + (244 - 184) * t);
        b = Math.round(42 + (214 - 42) * t);
      }
      ember.tint = (r << 16) | (g << 8) | b;
      ember.alpha = region.min + (region.max - region.min) * life;
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
