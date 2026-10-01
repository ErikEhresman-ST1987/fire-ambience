const FIRE_AUDIO_URL = 'assets/audio/Fireplace_wav_mp3.mp3';

export function createFireAudio() {
  const audio = new Audio(FIRE_AUDIO_URL);
  audio.loop = true;
  audio.preload = 'metadata';
  audio.volume = 0.7;

  return {
    async start() { await audio.play(); },
    stop() { audio.pause(); audio.currentTime = 0; },
    setVolume(value) { audio.volume = Math.max(0, Math.min(1, value)); },
    destroy() { audio.pause(); audio.removeAttribute('src'); audio.load(); }
  };
}
