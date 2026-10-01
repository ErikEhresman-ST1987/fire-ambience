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
- v18 ember treatment: used/evaluated on iPad and approved as the protected ember checkpoint
- v19 restrained low-flame proof: used on iPad and retained as the current visual checkpoint
- v20 continuous-audio proof: verified/evaluated on iPad; audio was somewhat more vigorous than the restrained dying-fire visuals
- v21 energy-match adjustment: default audio level reduced from 70% to 55%; published for real-use evaluation
- Sparks, additional scenes, procedural audio, polished controls, and PWA: deferred

## Current proof

The first complete experiential proof is now technically assembled:

**approved fireplace scene + living embers + restrained low flames + one continuous local fire recording**

The v20 audio layer uses assets/audio/Fireplace_wav_mp3.mp3, a user-prepared approximately 30-minute MP3 derived from a public-domain source and shortened/converted for this project. Preserve the original source URL/license record separately when available.

A single **Start Fire** button deliberately starts playback in response to user interaction. After successful playback begins, the control recedes. The audio system owns playback/looping/volume lifecycle; procedural crackles/pops/snaps remain deferred.

## Current thin point

Real-use evaluation of v21 on iPad Safari. The protected v18 ember treatment and v19 restrained low flames are unchanged; only the default audio level was reduced to better match their dying-fire energy.

Run the combined scene naturally and judge whether the 55% default now makes sound and visual activity feel like the same fire. Do not expand the feature set until this adjustment has been used and evaluated.

## Structure

- index.html — browser entry surface and minimal semantic controls
- css/ — interface and responsive presentation
- js/app.js — startup coordination
- js/fire-scene.js — PixiJS scene and fire effects
- js/fire-audio.js — fire audio playback/looping/volume lifecycle
- assets/scenes/ — canonical environment artwork
- assets/audio/ — locally served fire audio
- vendor/ — pinned local runtime dependencies such as PixiJS

Production assets and PixiJS are served locally. Do not add runtime CDN dependencies.

## Development rule

Before each increment, re-read the approved Goal Box and Foundation, inspect the repository and assets, identify the current thin point, define one bounded increment with acceptance criteria and exclusions, then stop for verification and real use when the increment is complete.
