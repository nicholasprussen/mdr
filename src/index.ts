import { GlobalState } from "./globalState";

let state: GlobalState;

function init() {
  state = new GlobalState();
  state.animate();
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



window.addEventListener('load', init);