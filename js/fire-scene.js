import { FIREPLACE_SCENE } from './fireplace-scene.js?v=6';

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

  // Pure animation diagnostic. Deliberately obvious and artistically wrong.
  // If this pulses, the Pixi ticker/render path works on the target device.
  const testPatch = new PIXI.Graphics()
    .rect(650, 610, 240, 100)
    .fill({ color: 0x00ff00, alpha: 1 });
  testPatch.alpha = 0;
  world.addChild(testPatch);

  app.stage.addChild(world);

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

  let elapsed = 0;
  app.ticker.add((ticker) => {
    elapsed += ticker.deltaMS;
    const cycle = (elapsed % 4000) / 4000;
    testPatch.alpha = (Math.sin(cycle * Math.PI * 2 - Math.PI / 2) + 1) / 2;
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
