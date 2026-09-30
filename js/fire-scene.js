import { FIREPLACE_SCENE } from './fireplace-scene.js?v=3';

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

  const glows = FIREPLACE_SCENE.embers.map((region) => {
    const group = new PIXI.Container();

    const emberCopy = new PIXI.Sprite(texture);
    emberCopy.blendMode = 'add';
    emberCopy.alpha = region.min;

    const mask = new PIXI.Graphics()
      .ellipse(
        region.x * FIREPLACE_SCENE.width,
        region.y * FIREPLACE_SCENE.height,
        region.rx * FIREPLACE_SCENE.width,
        region.ry * FIREPLACE_SCENE.height
      )
      .fill(0xffffff);

    const blur = new PIXI.BlurFilter({ strength: 10, quality: 2 });
    mask.filters = [blur];

    emberCopy.mask = mask;
    group.addChild(mask);
    group.addChild(emberCopy);
    emberLayer.addChild(group);

    return { emberCopy, region };
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

  app.ticker.add(() => {
    if (reduceMotion.matches) {
      for (const { emberCopy, region } of glows) emberCopy.alpha = region.min;
      return;
    }

    const now = performance.now();

    for (const { emberCopy, region } of glows) {
      const primary = Math.sin(now * region.speed + region.phase);
      const secondary = Math.sin(now * region.speed * 0.43 + region.phase * 1.7);
      const tertiary = Math.sin(now * region.speed * 0.19 + region.phase * 2.3);
      const life = Math.max(
        0,
        Math.min(1, 0.5 + primary * 0.26 + secondary * 0.16 + tertiary * 0.08)
      );

      emberCopy.alpha = region.min + (region.max - region.min) * life;
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
