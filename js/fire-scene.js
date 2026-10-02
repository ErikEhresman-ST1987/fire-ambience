import { getFireScene } from './fire-scenes.js?v=22';

export async function createFireScene(host, sceneId = 'fireplace') {
  const scene = getFireScene(sceneId);
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

  const texture = await PIXI.Assets.load(scene.image);
  const world = new PIXI.Container();
  const background = new PIXI.Sprite(texture);
  const emberLayer = new PIXI.Container();
  const flameLayer = new PIXI.Container();
  const ambientLightLayer = new PIXI.Container();

  world.addChild(background);
  world.addChild(emberLayer);
  world.addChild(flameLayer);
  world.addChild(ambientLightLayer);
  app.stage.addChild(world);

  // Shared proven v18/v19 behavior; each scene supplies only its mapped regions.
  const regions = scene.embers;
  const flameDefs = scene.flames;

  const emberRegions = regions.map((region) => {
    const container = new PIXI.Container();
    const copy = new PIXI.Sprite(texture);
    const color = new PIXI.ColorMatrixFilter();

    // Elliptical masks are deliberately small and overlap in places. Because
    // they reveal transformed source pixels rather than painted shapes, the
    // source coal/log texture remains the visible detail.
    const mask = new PIXI.Graphics()
      .ellipse(region.x, region.y, region.rx, region.ry)
      .fill(0xffffff);

    copy.mask = mask;
    copy.filters = [color];

    container.addChild(copy);
    container.addChild(mask);
    emberLayer.addChild(container);

    return { copy, color, region };
  });

  const ambientLights = (scene.ambientLights || []).map((region) => {
    const container = new PIXI.Container();
    const copy = new PIXI.Sprite(texture);
    const color = new PIXI.ColorMatrixFilter();
    const mask = new PIXI.Graphics().ellipse(region.x, region.y, region.rx, region.ry).fill(0xffffff);
    copy.mask = mask;
    copy.filters = [color];
    container.addChild(copy);
    container.addChild(mask);
    ambientLightLayer.addChild(container);
    return { copy, color, region };
  });

  // Restrained low-flame treatment remains a separate layer from approved embers.
  const flameGradients = [];
  const flames = flameDefs.map((def) => {
    const holder = new PIXI.Container();
    holder.position.set(def.x, def.y);

    const outerGradient = new PIXI.FillGradient({
      type: 'linear',
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
      textureSpace: 'local',
      colorStops: [
        { offset: 0, color: '#ffd36a' },
        { offset: 0.48, color: '#ff8a2b' },
        { offset: 1, color: '#d94718' }
      ]
    });
    const innerGradient = new PIXI.FillGradient({
      type: 'linear',
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
      textureSpace: 'local',
      colorStops: [
        { offset: 0, color: '#fff3b0' },
        { offset: 0.58, color: '#ffc247' },
        { offset: 1, color: '#ff6b1f' }
      ]
    });
    flameGradients.push(outerGradient, innerGradient);

    const outer = new PIXI.Graphics()
      .moveTo(-def.w * 0.48, 0)
      .bezierCurveTo(-def.w * 0.58, -def.h * 0.28, -def.w * 0.20, -def.h * 0.66, 0, -def.h)
      .bezierCurveTo(def.w * 0.12, -def.h * 0.70, def.w * 0.60, -def.h * 0.30, def.w * 0.48, 0)
      .closePath()
      .fill(outerGradient);

    const inner = new PIXI.Graphics()
      .moveTo(-def.w * 0.25, -1)
      .bezierCurveTo(-def.w * 0.28, -def.h * 0.22, -def.w * 0.08, -def.h * 0.46, 0, -def.h * 0.67)
      .bezierCurveTo(def.w * 0.10, -def.h * 0.45, def.w * 0.30, -def.h * 0.20, def.w * 0.25, -1)
      .closePath()
      .fill(innerGradient);

    // A very small blur softens vector edges without turning the proof into
    // a filter-heavy flame system.
    outer.filters = [new PIXI.BlurFilter({ strength: 1.2, quality: 2 })];
    inner.filters = [new PIXI.BlurFilter({ strength: 0.7, quality: 1 })];
    holder.blendMode = 'screen';
    holder.addChild(outer, inner);
    flameLayer.addChild(holder);

    return { holder, def };
  });

  function compose() {
    const rect = host.getBoundingClientRect();
    const viewW = Math.max(1, rect.width);
    const viewH = Math.max(1, rect.height);
    app.renderer.resize(viewW, viewH);

    const scale = Math.max(
      viewW / scene.width,
      viewH / scene.height
    );
    world.scale.set(scale);

    const scaledW = scene.width * scale;
    const scaledH = scene.height * scale;
    world.x = (viewW - scaledW) * scene.focus.x;
    world.y = (viewH - scaledH) * scene.focus.y;
  }

  compose();

  const resizeObserver = new ResizeObserver(compose);
  resizeObserver.observe(host);
  window.addEventListener('orientationchange', compose, { passive: true });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let elapsed = 0;

  app.ticker.add((ticker) => {
    elapsed += ticker.deltaMS;

    for (const { copy, color, region } of emberRegions) {
      if (reduceMotion.matches) {
        copy.alpha = 0;
        continue;
      }

      const primary = Math.sin((elapsed / region.period) * Math.PI * 2 + region.phase);
      const secondary = Math.sin((elapsed / (region.period * 1.71)) * Math.PI * 2 + region.phase * 1.91);
      const life = Math.max(0, Math.min(1, 0.5 + primary * 0.34 + secondary * 0.16));
      const heat = life * region.peak;

      // Keep very close to v17's successful perceived range. Region-specific
      // peak values vary only the upper end, so the hottest point wanders
      // naturally instead of every patch reaching the same maximum.
      color.reset();
      color.brightness(1.15 + heat * 2.85, false);
      color.contrast(1.0 + heat * 0.35, true);
      copy.alpha = 0.18 + heat * 0.82;
    }

    for (const { copy, color, region } of ambientLights) {
      if (reduceMotion.matches) {
        copy.alpha = 0;
        continue;
      }
      const primary = Math.sin((elapsed / region.period) * Math.PI * 2 + region.phase);
      const secondary = Math.sin((elapsed / (region.period * 1.83)) * Math.PI * 2 + region.phase * 1.47);
      const life = Math.max(0, Math.min(1, 0.5 + primary * 0.36 + secondary * 0.14));
      const amount = region.min + (region.max - region.min) * life;
      color.reset();
      color.brightness(1.04 + amount * 0.65, false);
      copy.alpha = 0.10 + amount * 0.72;
    }

    for (const { holder, def } of flames) {
      if (reduceMotion.matches) {
        holder.alpha = 0;
        continue;
      }

      // Two slow cycles create irregular rise/recede behavior. The threshold
      // gives each flame genuine quiet periods instead of a constant pulse.
      const primary = Math.sin((elapsed / def.period) * Math.PI * 2 + def.phase);
      const secondary = Math.sin((elapsed / (def.period * 0.61)) * Math.PI * 2 + def.phase * 1.73);
      const raw = 0.5 + primary * 0.34 + secondary * 0.16;
      const life = Math.max(0, Math.min(1, (raw - 0.31) / 0.69));

      holder.alpha = life * def.max;
      holder.scale.set(0.88 + life * 0.14, 0.72 + life * 0.32);
      holder.rotation = def.lean + Math.sin((elapsed / (def.period * 0.43)) * Math.PI * 2 + def.phase) * 0.035;
      holder.x = def.x + Math.sin((elapsed / (def.period * 0.37)) * Math.PI * 2 + def.phase * 0.7) * 2.2;
    }
  });

  return {
    app,
    destroy() {
      resizeObserver.disconnect();
      window.removeEventListener('orientationchange', compose);
      for (const gradient of flameGradients) gradient.destroy();
      app.destroy(true, { children: true });
    }
  };
}
