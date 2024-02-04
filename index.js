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
let cellSize;
let mouseX;
let mouseY;

function init() {
    cvWidth = cv.width;
    cvHeight = cv.height;
    cells = [];
    cellSize = 75;
    numWidth =  Math.floor(cvWidth / cellSize);
    numHigh = Math.floor(cvHeight / cellSize);
    marginY = (cvHeight - (numHigh * cellSize)) / 2;
    marginX = (cvWidth - (numWidth * cellSize)) / 2;
    console.log(cvHeight, cvWidth, marginX, marginY)
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

function calcDistance(x1, y1, x2, y2) {
    const X = x2 - x1;
    const Y = y2 - y1;
    return Math.sqrt(X * X + Y * Y );
}

function getRandomNumber() {
    return Math.floor(Math.random() * 10);
}

class Cell {
    number = getRandomNumber();
    x;
    y;
    numX;
    numY;
    color = "000000";

    constructor(x, y, color) {
        this.color = color;
        this.x = x;
        this.y = y;
        this.updateNumPos();
    }

    updateNumPos() {
        this.numX = this.x + (cellSize / 2);
        this.numY = this.y + (cellSize / 2);
    }

    getFontSize(distance) {
        let fontSize = 40;
        let upperLimit = 70;
        let maxDist = 100;
        let diff = upperLimit - fontSize;
        if (distance > maxDist) {
            return `${fontSize}px helvetica`;
        }
        let ratio = 1 - (distance / maxDist);
        fontSize = fontSize + (diff * ratio);
        return `${fontSize}px helvetica`
    }

    draw() {
        //ctx.fillStyle = this.color;
        ctx.fillStyle = "transparent";
        ctx.fillRect(this.x, this.y, cellSize, cellSize);
        ctx.textAlign="center"; 
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#aaf3fc"
        //ctx.filter = "blur(1px)";
        const distance = calcDistance(this.numX, this.numY, mouseX, mouseY);
        //console.log(distance)
        ctx.font = this.getFontSize(distance);
        ctx.fillText(this.number.toString(), this.numX, this.numY);
    }
}

function mouseMove(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
    //console.log(mouseX, mouseY);
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
            //console.log(existing, cellsCopy);
            if (existing !== null && existing !== undefined) {
                cells.push(cellsCopy[index]);
                cells[index].x = xLoc;
                cells[index].y = yLoc;
                cells[index].updateNumPos();
            } else {
                cells.push(new Cell(xLoc, yLoc, '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')));
            }
            index++;
        }
    }
    //console.log(cells)
}

function animate() {
  //ctx.clearRect(0, 0, cvWidth, cvHeight);
  // call again next time we can draw
  // clear canvas
  //ctx.fillRect()
  //ctx.clearRect(0, 0, cvWidth, cvHeight);
  //ctx.beginPath();
  requestAnimationFrame(animate);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, cvWidth, cvHeight);
  cells.forEach(cell => cell.draw());
//   cells.forEach(function(o) {
//     ctx.fillStyle = o.color;
//     ctx.fillRect(o.x, o.y, cellSize, cellSize);
//   });
}

//animate();

window.addEventListener('load', init);

window.addEventListener('resize', resize)

window.addEventListener('mousemove', mouseMove)

// click handler to add random rects
// window.addEventListener('click', function() {
//   addRandRect();
// });

// function addRandRect() {
//   let randColor = Math.random() > 0.5 ? 'blue' : 'red';
//   everyObject.push([Math.random() * cvWidth, Math.random() * cvHeight, 10 + Math.random() * 40, 10 + Math.random() * 40, randColor]);
// }