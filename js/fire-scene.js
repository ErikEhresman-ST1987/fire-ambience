import { FIREPLACE_SCENE } from './fireplace-scene.js?v=10';

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
  const proofLayer = new PIXI.Container();

  world.addChild(background);
  world.addChild(proofLayer);
  app.stage.addChild(world);

  // v10 diagnostic: deliberately use only PixiJS' basic Graphics + alpha path.
  // No masks, filters, blend modes, duplicated textures, or post-processing.
  // These markers sit directly over the ember bed so iPad Safari can prove
  // rendering, positioning, and animation independently of the failed effect path.
  const proofRegions = [
    { x: 625, y: 681, rx: 28, ry: 10, period: 1800, phase: 0.0 },
    { x: 690, y: 666, rx: 30, ry: 11, period: 2300, phase: 1.4 },
    { x: 755, y: 685, rx: 32, ry: 10, period: 2000, phase: 2.7 },
    { x: 820, y: 670, rx: 29, ry: 10, period: 2600, phase: 4.0 }
  ];

  const markers = proofRegions.map((region, index) => {
    const marker = new PIXI.Graphics()
      .ellipse(region.x, region.y, region.rx, region.ry)
      .fill(index % 2 === 0 ? 0x00ff66 : 0x00e5ff);

    marker.alpha = 0.12;
    proofLayer.addChild(marker);
    return { marker, region };
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

  let elapsed = 0;
  app.ticker.add((ticker) => {
    elapsed += ticker.deltaMS;

    for (const { marker, region } of markers) {
      const wave = (Math.sin((elapsed / region.period) * Math.PI * 2 + region.phase) + 1) / 2;
      marker.alpha = 0.12 + wave * 0.78;
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
