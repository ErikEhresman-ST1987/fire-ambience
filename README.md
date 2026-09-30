# Fire Ambience

A lightweight, local-first browser ambience app focused on creating the convincing experience of sitting near a real fire.

## Governing experience

**Open → Start Fire → Relax**

Primary target: iPad Safari. Browser-first delivery; offline normal use is a destination requirement. PixiJS is the selected renderer for the illustrated scene and ephemeral fire effects.

## Current status

- Goal Box v1.0: approved
- Project Foundation Plan v1.0: approved
- Canonical low-ember fireplace scene: approved
- Repository foundation: established
- Ember animation: not yet implemented
- Audio integration: not yet implemented
- Flames, sparks, additional scenes, procedural audio, and PWA: deferred

## Current thin point

Create the first bounded ember-animation proof against the approved fireplace scene. The effect should make localized ember regions brighten and fade independently and irregularly without looking like an overlay pasted onto a still image.

Stop after the ember proof is technically ready and test it on the actual iPad before expanding scope.

## Structure

- `index.html` — browser entry surface
- `css/` — interface and responsive presentation
- `js/` — application coordination and scene/audio systems as they are introduced
- `assets/scenes/` — canonical environment artwork and required visual assets
- `assets/audio/` — locally served fire audio
- `vendor/` — pinned local runtime dependencies such as PixiJS

Production assets and PixiJS should be served locally. Do not add runtime CDN dependencies.

## Development rule

Before each increment, re-read the approved Goal Box and Foundation, inspect the repository and assets, identify the current thin point, define one bounded increment with acceptance criteria and exclusions, then stop for verification and real use when the increment is complete.
