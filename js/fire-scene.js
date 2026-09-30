import { FIREPLACE_SCENE } from './fireplace-scene.js';

export async function createFireScene(host) {
  const PIXI = window.PIXI;
  if (!PIXI) throw new Error('PixiJS runtime was not loaded.');

  const app = new PIXI.Application();
  await app.init({
    resizeTo: host,
    background: '#000000',
    antialias: true,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2)
  });
  host.appendChild(app.canvas);

  const texture = await PIXI.Assets.load(FIREPLACE_SCENE.image);
  const world = new PIXI.Container();
  const background = new PIXI.Sprite(texture);
  const emberLayer = new PIXI.Container();

  world.addChild(background);
  world.addChild(emberLayer);
  app.stage.addChild(world);

  const glows = FIREPLACE_SCENE.embers.map((region) => {
    const glow = new PIXI.Graphics()
      .ellipse(0, 0, region.rx * FIREPLACE_SCENE.width, region.ry * FIREPLACE_SCENE.height)
      .fill({ color: 0xff5a18, alpha: 1 });

    glow.position.set(
      region.x * FIREPLACE_SCENE.width,
      region.y * FIREPLACE_SCENE.height
    );
    glow.alpha = region.min;
    glow.blendMode = 'add';
    glow.filters = [new PIXI.BlurFilter({ strength: 18, quality: 2 })];
    emberLayer.addChild(glow);
    return { glow, region };
  });

  function compose() {
    const viewW = app.renderer.width / app.renderer.resolution;
    const viewH = app.renderer.height / app.renderer.resolution;
    const scale = Math.max(viewW / FIREPLACE_SCENE.width, viewH / FIREPLACE_SCENE.height);

    world.scale.set(scale);
    const scaledW = FIREPLACE_SCENE.width * scale;
    const scaledH = FIREPLACE_SCENE.height * scale;

    world.x = (viewW - scaledW) * FIREPLACE_SCENE.focus.x;
    world.y = (viewH - scaledH) * FIREPLACE_SCENE.focus.y;
  }

  compose();
  window.addEventListener('resize', compose, { passive: true });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  app.ticker.add((ticker) => {
    if (reduceMotion.matches) {
      for (const { glow, region } of glows) glow.alpha = region.min;
      return;
    }

    const now = performance.now();
    for (const { glow, region } of glows) {
      const primary = Math.sin(now * region.speed + region.phase);
      const secondary = Math.sin(now * region.speed * 0.43 + region.phase * 1.7);
      const life = Math.max(0, Math.min(1, 0.5 + primary * 0.32 + secondary * 0.18));
      glow.alpha = region.min + (region.max - region.min) * life;
    }
  });

  return {
    app,
    destroy() {
      window.removeEventListener('resize', compose);
      app.destroy(true, { children: true });
    }
  };
}
