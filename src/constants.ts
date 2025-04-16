//General Game Settings
export const CELL_SIZE = 65;
export let CHANGE_PER_FRAME = 0.12; //This is the default. Updated continuously with frame rate

//Fade in
export const MIN_FADE_IN_START_TIME = 1;
export const MAX_FADE_IN_START_TIME = 2;
export const MIN_FADE_IN_DURATION = 0.5;
export const MAX_FADE_IN_DURATION = 2;

//Animation warm up
export const MIN_WARM_UP_DURATION = 1;
export const MAX_WARM_UP_DURATION = 3;

//Number animation
export const MIN_NUMBER_ANIMATION_DURATION = 3;
export const MAX_NUMBER_ANIMATION_DURATION = 3.5;
export const CHANCE_TO_MOVE = 0.40;

//Move number to center
export const MOVE_NUMBER_TO_CENTER_DURATION = 1;

//Mouse number highlighting
export const TRIGGER_DIRECTION_CHANGE_MARGIN = 15;
export const MOUSE_MAX_DISTANCE = 125;
export const MAX_FONT_SIZE = 75;
export const DEFAULT_FONT_SIZE = 32;
export const CLICK_DISTANCE = CELL_SIZE * 0.5;

//Number to bin animation
export const TOTAL_SECONDS_TO_BIN_NUMBER = 1.5;

//Percentage per number
export const MIN_PERCENTAGE_PER_NUMBER = 0.1;
export const MAX_PERCENTAGE_PER_NUMBER = 2.5;

//Startup
export const MAX_PRINTOUT_INTERVAL = 300;
export const MIN_PRINTOUT_INTERVAL = 100;

//Case files
export const CaseFiles: string[] = [
    "Allentown",
    "Trinity",
    "Todos Santos",
    "Astoria",
    "Lucknow",
    "St. Pierre",
    "Coleman",
    "Waynesboro",
    "Cork",
    "Molde",
    "Cairns",
    "Bodo",
    "Zurich",
    "Culpepper",
    "Bellingham",
    "Billings",
    "Yakima",
    "Loveland",
    "Merida",
    "Sopchoppy",
    "Vilnius",
    "Rhodes",
    "Wellington",
    "Dranesville",
    "Cold Harbor"
];

// export const FRAMES_TO_FULL_SPEED = 200;
// export const MAX_WARM_UP_PERIOD = 1000;