import { createFireScene } from './fire-scene.js?v=27';
import { createFireAudio } from './fire-audio.js?v=21';

const host = document.querySelector('#app');
const status = document.querySelector('#status');
const controls = document.querySelector('#fire-controls');
const sceneSelect = document.querySelector('#scene-select');
const startButton = document.querySelector('#start-fire');

async function start() {
  let fireScene = null;

  async function showScene(sceneId) {
    sceneSelect.disabled = true;
    try {
      fireScene?.destroy();
      fireScene = await createFireScene(host, sceneId);
    } finally {
      sceneSelect.disabled = false;
    }
  }

  try {
    await showScene(sceneSelect.value);
    const fireAudio = createFireAudio();
    status?.remove();

    sceneSelect.addEventListener('change', async () => {
      try {
        await showScene(sceneSelect.value);
      } catch (error) {
        console.error(error);
      }
    });

    startButton.addEventListener('click', async () => {
      startButton.disabled = true;
      sceneSelect.disabled = true;
      try {
        await fireAudio.start();
        controls.classList.add('is-hidden');
      } catch (error) {
        console.error(error);
        startButton.disabled = false;
        sceneSelect.disabled = false;
        startButton.textContent = 'Start Fire';
      }
    });

    controls.classList.add('is-ready');
  } catch (error) {
    console.error(error);
    if (status) status.textContent = 'Fire scene could not start.';
  }
}

start();
