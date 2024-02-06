cv = document.getElementById('canvas');
ctx = cv.getContext('2d');
cv.width = cv.getBoundingClientRect().width;
cv.height = cv.getBoundingClientRect().height;
let cvWidth;
let cvHeight;
let numWidth;
let numHigh;
let marginX;
let marginY;
let cells;
let cellSize = 125;
let mouseX = 999999;
let mouseY = 999999;
let chanceToMove = 0.15;
//let chanceToMove = 0;
let numFrames = 0;

let north = 0;
let east = 1;
let south = 2;
let west = 3;

let changePerFrame = 0.12;
let changePerFrameMargin = 15;
let framesToFullSpeed = 1000;

function init() {
    cvWidth = cv.width;
    cvHeight = cv.height;
    cells = [];
    numWidth =  Math.floor(cvWidth / cellSize);
    numHigh = Math.floor(cvHeight / cellSize);
    marginY = (cvHeight - (numHigh * cellSize)) / 2;
    marginX = (cvWidth - (numWidth * cellSize)) / 2;
    buildCells();
    animate();
}

function resize() {
    cv.width = cv.getBoundingClientRect().width;
    cv.height = cv.getBoundingClientRect().height;
    cvWidth = cv.width;
    cvHeight = cv.height;
    numWidth =  Math.floor(cvWidth / cellSize);
    numHigh = Math.floor(cvHeight / cellSize);
    marginY = (cvHeight - (numHigh * cellSize)) / 2;
    marginX = (cvWidth - (numWidth * cellSize)) / 2;
    buildCells();
}

class Cell {
    number;
    x;
    y;
    numX;
    numY;
    color = "000000";
    direction;
    timeToWait;

    constructor(x, y, color) {
        this.color = color;
        this.x = x;
        this.y = y;
        this.centerNums();
        this.number = this.getRandomNumber();
        this.direction = this.getInitialDirection();
    }

    getRandomNumber() {
        return Math.floor(Math.random() * 10);
    }

    updateNumPos() {
        //console.log(numFrames, this.direction)
        //console.log(this.timeToWait, numFrames)
        if (this.timeToWait > numFrames) { //Return if we don't want you to move yet
            //console.log(this.timeToWait, numFrames)
            return;
        }
        let speed;
        const framesSinceAnimStarted = numFrames - this.timeToWait;
        if (framesSinceAnimStarted > 0 && framesSinceAnimStarted < framesToFullSpeed) {
            speed = changePerFrame * (framesSinceAnimStarted / framesToFullSpeed);
        } else {
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
        }
    }

    centerNums() {
        this.numX = this.x + (cellSize / 2);
        this.numY = this.y + (cellSize / 2);
    }

    getFontSize(distance) {
        let fontSize = 85;
        let upperLimit = 115;
        let maxDist = 175;
        let diff = upperLimit - fontSize;
        if (distance > maxDist) {
            return `${fontSize}px helvetica`;
        }
        let ratio = 1 - (distance / maxDist);
        fontSize = fontSize + (diff * ratio);
        return `${fontSize}px helvetica`
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
            this.timeToWait = Math.floor(Math.random() * 2000);
            return direction;
        }
    }

    draw() {
        if (this.direction !== null && this.direction !== undefined) {
            this.updateNumPos();
        }
        // ctx.fillStyle = "trans";
        // ctx.fillRect(this.x, this.y, cellSize, cellSize);
        ctx.textAlign="center"; 
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#aaf3fc"
        const distance = this.calcDistance(this.numX, this.numY, mouseX, mouseY);
        ctx.font = this.getFontSize(distance);
        ctx.fillText(this.number.toString(), this.numX, this.numY);
    }
}

function mouseMove(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
}

function buildCells() {
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
}

function animate() {
  //console.log(numFrames);
  ctx.fillStyle = "#000";
  
  ctx.fillRect(0, 0, cvWidth, cvHeight);
  cells.forEach(cell => cell.draw());
  numFrames++;

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

window.addEventListener('resize', debounce(resize, 300))

window.addEventListener('mousemove', mouseMove)

window.addEventListener('touchmove', mouseMove);