import { createFireScene } from './fire-scene.js?v=20';
import { createFireAudio } from './fire-audio.js?v=20';

const host = document.querySelector('#app');
const status = document.querySelector('#status');
const startButton = document.querySelector('#start-fire');

async function start() {
  try {
    await createFireScene(host);
    const fireAudio = createFireAudio();
    status?.remove();
    startButton?.addEventListener('click', async () => {
      startButton.disabled = true;
      try {
        await fireAudio.start();
        startButton.classList.add('is-hidden');
      } catch (error) {
        console.error(error);
        startButton.disabled = false;
        startButton.textContent = 'Start Fire';
      }
    });
    startButton?.classList.add('is-ready');
  } catch (error) {
    console.error(error);
    if (status) status.textContent = 'Fire scene could not start.';
  }
}

start();
