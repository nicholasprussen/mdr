import { GlobalState } from "./global-state";
import { SaveGame } from "./models/localstorage/save-game";
import { Startup } from "./startup";
import { StartupAnimation } from "./startup-animation";
import { startupText } from "./startup-text";
let state: GlobalState;

async function init(): Promise<void> {
  generateHexCodes();
  state = new GlobalState();

  let saveState = new SaveGame();

  if (window.localStorage.)

  //Initialize and run startup. 
  //TODO, check for startup already happened. Skip if present
  
  await startup();


  //Initialize and run the main application

  //state.animate(0);
}

async function startup(): Promise<void> {

  const startup = new Startup();
  await startup.start();
  const startupAnimation = new StartupAnimation();
  await startupAnimation.start();
  (document.getElementById('app') as HTMLDivElement).style.animation = 'fade-in 1000ms';
  setTimeout(() => {
    (document.getElementById('app') as HTMLDivElement).style.opacity = '1';
    state.start();
  }, 500)
  console.log("Completed")
}


function debounce(callback: () => {}, delay: number) {
  let timer: any;
  return function() {
    clearTimeout(timer)
    timer = setTimeout(() => {
      callback();
    }, delay)
  }
}

function generateHexCodes(): void {
  const hexSpans = document.querySelectorAll('.hex-inner') as unknown as HTMLSpanElement[];
  for(let elem of hexSpans) {
    elem.innerHTML = (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')?.toUpperCase();
  }
}


window.addEventListener('load', init);