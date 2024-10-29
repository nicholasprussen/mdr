import { Cell } from "./cell";
import { CELL_SIZE, CLICK_DISTANCE } from "./constants";
import { Direction } from "./direction";

export class GlobalState {
    canvasContainer!: HTMLDivElement;
    canvasElement!: HTMLCanvasElement;
    canvasContext!: CanvasRenderingContext2D;

    canvasWidth: number = 0;
    canvasHeight: number = 0;

    gridWidth: number = 0;
    gridHeight: number = 0;

    marginY: number = 0;
    marginX: number = 0;

    offsetX: number = 0;
    offsetY: number = 0;

    Grid: Cell[] = [];

    numFramesSinceReset: number = 0;
    totalFramesSinceAppStart: number = 0;

    containerElements: HTMLDivElement[] = [];

    mouseCurrentlyClicked: boolean = false;

    paused: boolean = false;

    lastDrawDate: Date;

    CHANGE_PER_FRAME = 0.12;

    mouseX: number = 9999999999;
    mouseY: number = 9999999999;
    mouseClickPoints: number[][] = [];

    constructor() {
        this.createCanvas();
        this.createGrid();
        this.lastDrawDate = new Date();

        window.addEventListener('resize', this.resize.bind(this));
    }

    createCanvas(): void {
        this.canvasContainer = document.getElementById("canvas-container") as HTMLDivElement;
        if (this.canvasContainer == null) {
            throw new Error("Canvas container is missing");
        }
        
        this.canvasElement = document.createElement('canvas');

        this.canvasElement.addEventListener('mousemove', this.mouseMove.bind(this));
        this.canvasElement.addEventListener('mouseup', this.mouseUp.bind(this));
        this.canvasElement.addEventListener('mousedown', this.mouseDown.bind(this));

        this.setupBoxListeners();

        this.canvasContext = this.canvasElement.getContext('2d') as CanvasRenderingContext2D;

        const canvasContainerBoundingBox = this.canvasContainer.getBoundingClientRect();
        this.canvasElement.width = canvasContainerBoundingBox.width ?? 0;
        this.canvasElement.height = canvasContainerBoundingBox.height ?? 0;

        this.canvasHeight = canvasContainerBoundingBox.height ?? 0;
        this.canvasWidth = canvasContainerBoundingBox.width ?? 0;

        this.canvasContainer.appendChild(this.canvasElement);
    }

    createGrid(): void {
        this.gridWidth = Math.floor(this.canvasWidth / CELL_SIZE);
        this.gridHeight = Math.floor(this.canvasHeight / CELL_SIZE);

        this.marginX = (this.canvasWidth - (this.gridWidth * CELL_SIZE)) / 2;
        this.marginY = (this.canvasHeight - (this.gridHeight * CELL_SIZE)) / 2;

        const canvasBoundingRect = this.canvasElement?.getBoundingClientRect();
        this.offsetX = canvasBoundingRect?.left ?? 0;
        this.offsetY = canvasBoundingRect?.top ?? 0;

        this.buildCells();
    }

    buildCells(rebuild: boolean = false) {
        let gridCopy = [...this.Grid];
        this.Grid = [];
        let index = 0;
        for(let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                let xLoc = this.marginX + (x * CELL_SIZE);
                let yLoc = this.marginY + (y * CELL_SIZE);
                const existing = gridCopy[index];
                if (existing !== null && existing !== undefined) {
                    this.Grid.push(gridCopy[index]);
                    this.Grid[index].resetNum(xLoc, yLoc);
                } else {
                    this.Grid.push(
                        new Cell(
                            xLoc,
                            yLoc,
                            () => this.CHANGE_PER_FRAME,
                            () => this.paused,
                            x === 0 && y===0)
                    );
                }
                index++;
            }
        }
        if (rebuild === true) {
            this.numFramesSinceReset = 0;
            this.Grid.forEach(cell => cell.pastWarmUpPeriod = false);
        }
    }

    setupBoxListeners(): void {
        const boxElements = document.getElementsByTagName('boxy-box') as unknown as any[];
        for(let element of boxElements) {
            console.log(element);
            this.containerElements.push(element);
            element.addEventListener('click', (event: MouseEvent) => this.containerBoxClickListener.bind(this)(event, element));
        }
    }

    containerBoxClickListener(event: MouseEvent, element: HTMLDivElement): void {
        this.paused = true;
        const clickedCells = this.Grid.filter(cell => cell.selected);
        if (clickedCells.length < 1) {
            this.paused = false;
            return;
        }
        const elementBoundingRect = element.getBoundingClientRect();
        clickedCells.forEach(cell => {
            cell.previousDirection = cell.direction;
            cell.direction = 5;
            cell.containerDestinationPos = {
                containerX: elementBoundingRect.x + (elementBoundingRect.width / 2),
                containerY: elementBoundingRect.y + (elementBoundingRect.height / 2)
            }
        })

        console.log(element);
        const shadowRoot = element.shadowRoot;
        if (shadowRoot == null) {
            return;
        }

        //TODO We need a global state for the 5 boxes. Parsing the values from the HTML is a pain in the ass
        // const textEl = shadowRoot.querySelector(".box-percentage-text");
        // const previousPercent
        // console.log(el)
    }

    mouseMove(event: MouseEvent) {
        this.mouseX = event.clientX - this.offsetX;
        this.mouseY = event.clientY - this.offsetY;
        if (!this.mouseCurrentlyClicked) {
            return;
        }
        this.mouseClickPoints.push([this.mouseX, this.mouseY]);
        this.selectBoxes();
    }

    selectBoxes(): void {
        const boxes = this.Grid.filter(cell => cell.distanceFromMouse < CLICK_DISTANCE && !cell.selected);
        //const box = cells.find(cell => cell.x <= mouseX && (cell.x + cellSize) > mouseX && cell.y <= mouseY && (cell.y + cellSize) > mouseY)
        // if (box === previousCell) {
        //     return;
        // }
        boxes.forEach(box => {
            box.selected = true;
            box.previousDirection = box.direction;
            if (box?.direction !== undefined) {
                box.direction = Direction.BACK_TO_CENTER;
            }
        })
        // box.clicked = true;
        // previousCell = box;
    }

    mouseUp(event: MouseEvent): void {
        this.mouseCurrentlyClicked = false;
    }

    mouseDown(event: MouseEvent): void {
        if (this.paused) {
            return;
        }
        this.Grid.filter(cell => cell.selected).forEach(cell => {
            cell.selected = false;
            cell.direction = cell.previousDirection;
            cell.pastWarmUpPeriod = false;
        })
        this.numFramesSinceReset = 0;
        this.mouseCurrentlyClicked = true;
    }

    animate() {
        this.canvasContext.fillStyle = "#010408";
      
        let date = new Date();
        let diff = date.getTime() - this.lastDrawDate.getTime();
        if (diff > 100) {
          diff = 100;
        }
        var fps = 1000 / diff;
        this.lastDrawDate = date;
      
        this.CHANGE_PER_FRAME = 10 / fps;
      
        if (this.paused) {
          const noneMoving = !this.Grid.some(cell => cell.direction === Direction.TO_CONTAINER);
          if (noneMoving) {
              this.paused = false;
          }
        }
        
        this.canvasContext.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.Grid.forEach(cell => cell.drawNumber(this.canvasContext, this.numFramesSinceReset, this.totalFramesSinceAppStart, this.mouseX, this.mouseY));
        this.numFramesSinceReset++;
        this.totalFramesSinceAppStart++;
      
        requestAnimationFrame(this.animate.bind(this));
    }

    resize() {
        const boundingRect = this.canvasElement.getBoundingClientRect();
        // const bodBoundingRect = document.getElementById('body').getBoundingClientRect();
        // cv.width = bodBoundingRect.width;
        // cv.height = boundingRect.height;
        this.canvasElement.height = boundingRect.height;
        this.canvasElement.width = boundingRect.width;
        this.offsetY = boundingRect.top;
        this.offsetX = boundingRect.left;
        this.canvasWidth = this.canvasElement.width;
        this.canvasHeight = this.canvasElement.height;
        this.gridWidth =  Math.floor(this.canvasWidth / CELL_SIZE);
        this.gridHeight = Math.floor(this.canvasHeight / CELL_SIZE);
        this.marginY = (this.canvasHeight - (this.gridHeight * CELL_SIZE)) / 2;
        this.marginX = (this.canvasWidth - (this.gridWidth * CELL_SIZE)) / 2;
        this.buildCells(true);
    }
}