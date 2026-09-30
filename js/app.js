import { createFireScene } from './fire-scene.js?v=9';

const host = document.querySelector('#app');
const status = document.querySelector('#status');

async function start() {
  try {
    await createFireScene(host);
    status?.remove();
  } catch (error) {
    console.error(error);
    if (status) status.textContent = 'Fire scene could not start.';
  }
}

start();
