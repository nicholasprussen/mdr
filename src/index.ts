import { CHANGE_PER_FRAME } from "./constants";
import { Direction } from "./direction";
import { GlobalState } from "./globalState";

let time: Date;
let state: GlobalState;

function init() {
    state = new GlobalState();
    time = new Date();
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