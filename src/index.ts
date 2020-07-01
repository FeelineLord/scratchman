import * as PIXI from 'pixi.js';
import {App} from './models/App';
import './styles/styles.scss';

const start = (width, height) => {
  const root = document.querySelector('#root') as HTMLElement;
  const scratch = new PIXI.Application({
    antialias: true,
    width,
    height,
    transparent: true
  });

  scratch.view.id = 'scratch';
  scratch.view.className= 'scratch';

  root.append(scratch.view);

  const app = new App(scratch, width, height);

  app.start();
};

window.addEventListener('load', () => {
  start(1096, 1920);
});

window.addEventListener('resize', () => {
  const scratch = document.querySelector('#scratch') as HTMLCanvasElement;
  if (window.innerWidth < scratch.offsetWidth) {
    scratch.style.height = 'auto';
    scratch.style.width = '100%';
  } else if (
    window.innerHeight < scratch.offsetHeight
  ) {
    scratch.style.width = 'auto';
    scratch.style.height = '100vh';
  }
});
