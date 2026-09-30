import { FIREPLACE_SCENE } from './fireplace-scene.js?v=5';

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
  world.addChild(background);
  app.stage.addChild(world);

  // Diagnostic proof: one clearly visible localized ember region.
  // This intentionally exaggerates the cycle so actual-device testing can
  // establish that the mechanism works before we tune it for realism.
  const region = {
    x: 0.475,
    y: 0.625,
    rx: 0.105,
    ry: 0.028
  };

  const diagnosticGlow = new PIXI.Graphics()
    .ellipse(
      region.x * FIREPLACE_SCENE.width,
      region.y * FIREPLACE_SCENE.height,
      region.rx * FIREPLACE_SCENE.width,
      region.ry * FIREPLACE_SCENE.height
    )
    .fill({ color: 0xff6a18, alpha: 1 });

  diagnosticGlow.blendMode = 'add';
  diagnosticGlow.filters = [new PIXI.BlurFilter({ strength: 16, quality: 2 })];
  world.addChild(diagnosticGlow);

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
      diagnosticGlow.alpha = 0.12;
      return;
    }

    // Six-second full cycle: intentionally obvious for verification.
    const cycle = (performance.now() % 6000) / 6000;
    const wave = (Math.sin(cycle * Math.PI * 2 - Math.PI / 2) + 1) / 2;
    diagnosticGlow.alpha = 0.03 + wave * 0.72;
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
