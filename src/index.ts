import { GlobalState } from "./global-state";

let state: GlobalState;

function init() {
  generateHexCodes();
  state = new GlobalState();
  state.animate(0);
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
  const hexSpans = document.querySelectorAll('span.hex-code') as unknown as HTMLSpanElement[];
  for(let elem of hexSpans) {
    elem.innerHTML = '0x'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')?.toUpperCase();
  }
}


window.addEventListener('load', init);