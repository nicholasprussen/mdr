const cvContainer = document.getElementById('canvas-container');

let cv;
let ctx;
// cv = document.getElementById('canvas');
// ctx = cv.getContext('2d');
// cv.width = cv.getBoundingClientRect().width;
// cv.height = cv.getBoundingClientRect().height;
let cvWidth;
let cvHeight;
let numWidth;
let numHigh;
let marginX;
let marginY;
let cells;
let cellSize = 65;
let clickDistance = (cellSize * 0.5);
let mouseX = 999999;
let mouseY = 999999;
let chanceToMove = 0.40;
//let chanceToMove = 0;
let numFrames = 0;
let trueNumFrames = 0;

let north = 0;
let east = 1;
let south = 2;
let west = 3;

let changePerFrame = 0.12;
let changePerFrameMargin = 15;
let framesToFullSpeed = 200;

let time;

let pause = false;

let offsetX = 0;
let offsetY = 0;

let mouseClicked = false;
let mouseClickPoints = [];
let previousCell;

let defaultFontSize = 32;

let boxElements = [];

let destinationX = 0;
let destinationY = 0;

function boxClickListener(event, element) {
    console.log("clicked")
    pause = true;
    let clickedCells = cells.filter(cell => cell.clicked);
    if (clickedCells.length < 1) {
        pause = false;
        return;
    }
    clickedCells.forEach(cell => {
        cell.previousDirection = cell.direction;
        cell.direction = 5;
    })
    const elementBoundingRect = element.getBoundingClientRect();
    destinationX = elementBoundingRect.x + (elementBoundingRect.width / 2);
    destinationY = elementBoundingRect.y + (elementBoundingRect.height / 2);
}

function setupBoxListeners() {
    boxElements = document.getElementsByClassName('box');
    console.log(boxElements);
    for (let element of boxElements) {
        console.log(element)
        element.addEventListener('click', (event) => boxClickListener(event, element));
    }
}

function init() {
    cv = document.createElement('canvas');
    ctx = cv.getContext('2d');
    cv.addEventListener('mousemove', mouseMove)

    cv.addEventListener('mousedown', () => {
        if (pause) {
            return;
        }
        cells.filter(cell => cell.clicked).forEach(cell => {
            cell.clicked = false;
            cell.direction = cell.previousDirection;
            cell.pastWarmup = false;
        })
        numFrames = 0;
        mouseClicked = true
    })

    cv.addEventListener('mouseup', () => {
        mouseClicked = false;
    }) 

    this.setupBoxListeners();

    const cvContainerBoundingRect = cvContainer.getBoundingClientRect();
    cv.height = cvContainerBoundingRect.height;
    cv.width = cvContainerBoundingRect.width;
    cvContainer.appendChild(cv);
    cvWidth = cv.width;
    cvHeight = cv.height;
    cells = [];
    numWidth =  Math.floor(cvWidth / cellSize);
    numHigh = Math.floor(cvHeight / cellSize);
    marginY = (cvHeight - (numHigh * cellSize)) / 2;
    marginX = (cvWidth - (numWidth * cellSize)) / 2;
    const boundingRect = cv.getBoundingClientRect();
    offsetY = boundingRect.top;
    offsetX = boundingRect.left;
    buildCells();
    time = new Date();
    //ctx.filter = 'blur(1px)'
    animate();
}

function resize() {
    const boundingRect = cv.parentNode.getBoundingClientRect();
    // const bodBoundingRect = document.getElementById('body').getBoundingClientRect();
    // cv.width = bodBoundingRect.width;
    // cv.height = boundingRect.height;
    cv.height = boundingRect.height;
    cv.width = boundingRect.width;
    offsetY = boundingRect.top;
    offsetX = boundingRect.left;
    cvWidth = cv.width;
    cvHeight = cv.height;
    numWidth =  Math.floor(cvWidth / cellSize);
    numHigh = Math.floor(cvHeight / cellSize);
    marginY = (cvHeight - (numHigh * cellSize)) / 2;
    marginX = (cvWidth - (numWidth * cellSize)) / 2;
    buildCells(true);
}

class Cell {
    number;
    x;
    y;
    numX;
    numY;
    color = "000000";
    direction;
    previousDirection;
    timeToWait;
    clicked = false;
    previousFontSize = 32;
    distance = 9999999;
    pastWarmup = false;

    constructor(x, y, color) {
        this.color = color;
        this.x = x;
        this.y = y;
        this.centerNums();
        this.number = this.getRandomNumber();
        this.direction = this.getInitialDirection();
        this.previousDirection = this.direction;
    }

    getRandomNumber() {
        return Math.floor(Math.random() * 10);
    }

    updateNumPos() {
        //console.log(numFrames, this.direction)
        //console.log(this.timeToWait, numFrames)
        if (this.timeToWait > numFrames && !this.pastWarmup && !pause) { //Return if we don't want you to move yet
            //console.log(this.timeToWait, numFrames)
            return;
        }
        let speed;
        const framesSinceAnimStarted = numFrames - this.timeToWait;
        if (!this.pastWarmup && framesSinceAnimStarted > 0 && framesSinceAnimStarted < framesToFullSpeed) {
            speed = changePerFrame * (framesSinceAnimStarted / framesToFullSpeed);
        } else {
            this.pastWarmup = true;
            speed = changePerFrame;
        }

        let outside;
        switch(this.direction) {
            case 0: //North
                outside = this.numY <= this.y + changePerFrameMargin;
                if (!outside) {
                    this.numY -= speed;
                } else {
                    this.direction = 2;
                    this.numY += speed;
                }
                break;
            case 2: //South
                outside = this.numY >= this.y + (cellSize - changePerFrameMargin);
                if (!outside) {
                    this.numY += speed;
                } else {
                    this.direction = 0;
                    this.numY -= speed;
                }
                break;
            case 1: //West
                outside = this.numX <= this.x + changePerFrameMargin;
                if (!outside) {
                    this.numX -= speed;
                } else {
                    this.direction = 3;
                    this.numX += speed;
                }
                break;
            case 3: //East
                outside = this.numX >= this.x + (cellSize - changePerFrameMargin);
                if (!outside) {
                    this.numX += speed;
                } else {
                    this.direction = 1;
                    this.numX -= speed;
                }
                break;
            case 4: //Back to center
                const centerX = this.x + (cellSize / 2);
                const centerY = this.y + (cellSize / 2);
                if (this.numX === centerX && this.numY === centerY) {
                    return;
                }


                if (this.numX > centerX) { //X
                    this.numX -= speed;
                    if (this.numX < centerX) {
                        this.numX = centerX;
                    }
                } else if (this.numX < centerX) {
                    this.numX += speed;
                    if (this.numX > centerX) {
                        this.numX = centerX;
                    }
                }

                if (this.numY > centerY) { //Y
                    this.numY -= speed;
                    if (this.numY < centerY) {
                        this.numY = centerY;
                    }
                } else if (this.numY < centerY) {
                    this.numY += speed;
                    if (this.numY > centerY) {
                        this.numY = centerY;
                    }
                }
                break;
            case 5: //Destination
                if (this.numX === destinationX && this.numY === destinationY) {
                    this.centerNums();
                    this.pastWarmup = false;
                    this.timeToWait = trueNumFrames + 500;
                    this.number = this.getRandomNumber();
                    this.direction = this.previousDirection;
                    this.clicked = false;
                    return;
                }

                let speedX = speed * 100;
                let speedY = speed * 75;


                if (this.numX > destinationX) { //X
                    this.numX -= speedX;
                    if (this.numX < destinationX) {
                        this.numX = destinationX;
                    }
                } else if (this.numX < destinationX) {
                    this.numX += speedX;
                    if (this.numX > destinationX) {
                        this.numX = destinationX;
                    }
                }

                if (this.numY > destinationY) { //Y
                    this.numY -= speedY;
                    if (this.numY < destinationY) {
                        this.numY = destinationY;
                    }
                } else if (this.numY < destinationY) {
                    this.numY += speedY;
                    if (this.numY > destinationY) {
                        this.numY = destinationY;
                    }
                }
                break;
        }
    }

    centerNums() {
        this.numX = this.x + (cellSize / 2);
        this.numY = this.y + (cellSize / 2);
    }

    getFontSize(distance, clicked) {
        let upperLimit = 75;
        let maxDist = 125;
        if (clicked) {
            if (this.previousFontSize === upperLimit) {
                return `${this.previousFontSize}px helvetica`;
            }
            this.previousFontSize += (changePerFrame * 2);
            if (this.previousFontSize > upperLimit) {
                this.previousFontSize = upperLimit;
            }
            return `${this.previousFontSize}px helvetica`;
        } else {
            this.previousFontSize = defaultFontSize;
        }
        if (distance === NaN) {
            this.previousFontSize = defaultFontSize;
            return `${this.previousFontSize}px helvetica`;
        }
        let diff = upperLimit - defaultFontSize;
        if (distance > maxDist) {
            return `${this.previousFontSize}px helvetica`;
        }
        let ratio = 1 - (distance / maxDist);
        this.previousFontSize = defaultFontSize + (diff * ratio);
        return `${this.previousFontSize}px helvetica`
    }

    calcDistance(x1, y1, x2, y2) {
        const X = x2 - x1;
        const Y = y2 - y1;
        return Math.sqrt(X * X + Y * Y );
    }

    getInitialDirection() {
        const chance = Math.random();
        if (chance < chanceToMove) {
            const direction = Math.floor(Math.random() * 4);
            this.timeToWait = Math.floor(Math.random() * 500);
            return direction;
        }
    }

    getFontOpacity() {
        let opacity = 1;
        if (this.timeToWait === undefined || this.pastWarmup || this.timeToWait < trueNumFrames) {
            return opacity;
        }
        opacity = trueNumFrames / this.timeToWait;
        return opacity;
    }

    draw() {
        // if (this.clicked && !this.clickHandled) {
        //     this.centerNums();
        // }
        if (this.direction !== null && this.direction !== undefined) {
            this.updateNumPos();
        }
        // ctx.fillStyle = "trans";
        // ctx.fillRect(this.x, this.y, cellSize, cellSize);
        ctx.textAlign="center"; 
        ctx.textBaseline = "middle";
        ctx.fillStyle = `rgba(170, 243, 252, ${this.getFontOpacity()})`
        //ctx.filter = 'blur(2px)';
        this.distance = this.calcDistance(this.numX, this.numY, mouseX, mouseY);
        ctx.font = this.getFontSize(this.distance, this.clicked);
        ctx.fillText(this.number.toString(), this.numX, this.numY);
    }
}

function mouseMove(event) {
    mouseX = event.clientX - offsetX;
    mouseY = event.clientY - offsetY;
    if (!mouseClicked) {
        return;
    }
    mouseClickPoints.push([mouseX, mouseY]);
    selectBoxes();
}

function selectBoxes() {
    const boxes = cells.filter(cell => cell.distance < clickDistance && !cell.clicked);
    //const box = cells.find(cell => cell.x <= mouseX && (cell.x + cellSize) > mouseX && cell.y <= mouseY && (cell.y + cellSize) > mouseY)
    // if (box === previousCell) {
    //     return;
    // }
    boxes.forEach(box => {
        box.clicked = true;
        box.previousDirection = box.direction;
        if (box?.direction !== undefined) {
            box.direction = 4;
        }
    })
    // box.clicked = true;
    // previousCell = box;
}

function mouseClick(event) {
    console.log(event.clientX, event.clientY)
}

function buildCells(rebuild = false) {
    let cellsCopy = [...cells];
    cells = [];
    let index = 0;
    for(let x = 0; x < numWidth; x++) {
        for (let y = 0; y < numHigh; y++) {
            let xLoc = marginX + (x * cellSize);
            let yLoc = marginY + (y * cellSize);
            const existing = cellsCopy[index];
            if (existing !== null && existing !== undefined) {
                cells.push(cellsCopy[index]);
                cells[index].x = xLoc;
                cells[index].y = yLoc;
                cells[index].centerNums();
            } else {
                cells.push(new Cell(xLoc, yLoc, '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')));
            }
            index++;
        }
    }
    if (rebuild === true) {
        numFrames = 0;
        cells.forEach(cell => cell.pastWarmup = false);
    }
}

function animate() {
  //console.log(numFrames);
  ctx.fillStyle = "#010408";

  var date = new Date();
  var diff = date - time;
  if (diff > 100) {
    diff = 100;
  }
  var fps = 1000 / diff;
  time = date;


  changePerFrame = 10 / fps;

  if (pause) {
    const noneMoving = !cells.some(cell => cell.direction === 5);
    if (noneMoving) {
        pause = false;
    }
  }
  
  ctx.fillRect(0, 0, cvWidth, cvHeight);
  cells.forEach(cell => cell.draw());
  numFrames++;
  trueNumFrames++;

  requestAnimationFrame(animate);
}

function debounce(callback, delay) {
    let timer
    return function() {
      clearTimeout(timer)
      timer = setTimeout(() => {
        callback();
      }, delay)
    }
  }

window.addEventListener('load', init);

window.addEventListener('resize', resize)