import { Cell } from "./cell";
import { CELL_SIZE, CLICK_DISTANCE, MAX_PERCENTAGE_PER_NUMBER, MIN_PERCENTAGE_PER_NUMBER } from "./constants";
import { ShippingBox } from "./shipping-box";

export type ShippingBoxMap = {
    '01': ShippingBox,
    '02': ShippingBox,
    '03': ShippingBox,
    '04': ShippingBox,
    '05': ShippingBox
}

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
    fps: number = 60;

    mouseX: number = 9999999999;
    mouseY: number = 9999999999;
    mouseClickPoints: number[][] = [];

    ShippingBoxMap: ShippingBoxMap;

    constructor() {
        this.createCanvas();
        this.createGrid();

        this.ShippingBoxMap = this.createShippingBoxes();
        console.log(this.ShippingBoxMap);

        this.lastDrawDate = new Date();

        window.addEventListener('resize', this.resize.bind(this));
    }

    createCanvas(): void {
        this.canvasContainer = document.getElementById("canvas-container") as HTMLDivElement;
        if (this.canvasContainer == null) {
            throw new Error("Canvas container is missing");
        }
        
        this.canvasElement = document.createElement('canvas');


        if (
            ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0)
        ) {
            this.canvasElement.addEventListener('touchstart', this.mouseDown.bind(this));
            this.canvasElement.addEventListener('touchend', this.mouseUp.bind(this));
            this.canvasElement.addEventListener('touchmove', this.mouseMove.bind(this));
        } else {
            this.canvasElement.addEventListener('mousemove', this.mouseMove.bind(this));
            this.canvasElement.addEventListener('mouseup', this.mouseUp.bind(this));
            this.canvasElement.addEventListener('mousedown', this.mouseDown.bind(this));
        }

        // this.setupBoxListeners();

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

    createShippingBoxes(): ShippingBoxMap {
        const shippingBoxes = document.getElementsByTagName('boxy-box') as unknown as any[];
        const shippingBoxMap: {[key: string]: ShippingBox} = {};
        let index = 1;
        for(let element of shippingBoxes) {
            const newShippingBox = new ShippingBox(
                element,
                this.shippingBoxCallback.bind(this)
            );
            shippingBoxMap[`0${index}`] = newShippingBox;
            index++;
        }
        return shippingBoxMap as ShippingBoxMap;
    }

    shippingBoxCallback = (event: MouseEvent, shippingBox: ShippingBox) => {
        this.containerBoxClickListener(event, shippingBox);
        console.log(`Shipping Box ${shippingBox.element}`);
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
                            () => this.fps,
                            x === 0 && y===0)
                    );
                }
                index++;
            }
        }
        // if (rebuild === true) {
        //     this.numFramesSinceReset = 0;
        //     this.Grid.forEach(cell => cell.pastWarmUpPeriod = false);
        // }
    }

    setupBoxListeners(): void {
        const boxElements = document.getElementsByTagName('boxy-box') as unknown as any[];
        for(let element of boxElements) {
            console.log(element);
            this.containerElements.push(element);
            element.addEventListener('click', (event: MouseEvent) => this.containerBoxClickListener.bind(this)(event, element));
        }
    }

    private startBoxOpenAnimation(shippingBox: ShippingBox): void {
        const leftFlap = (shippingBox.element.shadowRoot?.querySelector('.shadow-top-left') as HTMLDivElement);
        const rightFlap = (shippingBox.element.shadowRoot?.querySelector('.shadow-top-right') as HTMLDivElement);

        leftFlap.style.animation = `0.5s 1 ease-in-out open-left-side forwards`;
        rightFlap.style.animation = `0.5s 1 ease-in-out open-right-side forwards`;
    }

    private closeBoxAnimation(shippingBox: ShippingBox): void {
        const leftFlap = (shippingBox.element.shadowRoot?.querySelector('.shadow-top-left') as HTMLDivElement);
        const rightFlap = (shippingBox.element.shadowRoot?.querySelector('.shadow-top-right') as HTMLDivElement);

        leftFlap.style.animation = `0.5s 1 ease-in-out close-left-side forwards`;
        rightFlap.style.animation = `0.5s 1 ease-in-out close-right-side forwards`;
    }

    private clearBoxAnimation(shippingBox: ShippingBox): void {
        const leftFlap = (shippingBox.element.shadowRoot?.querySelector('.shadow-top-left') as HTMLDivElement);
        const rightFlap = (shippingBox.element.shadowRoot?.querySelector('.shadow-top-right') as HTMLDivElement);

        leftFlap.style.animation = ``;
        rightFlap.style.animation = ``;
    }

    async containerBoxClickListener(_: MouseEvent, shippingBox: ShippingBox): Promise<void> {
        this.paused = true;
        const clickedCells = this.Grid.filter(cell => cell.selected);
        if (clickedCells.length < 1) {
            this.paused = false;
            return;
        }
        console.log(shippingBox.element);
        this.startBoxOpenAnimation(shippingBox);

        const cellFinishedBinningPromises: Promise<void>[] = [];

        let percentageToBeAdded: number = 0;

        clickedCells.forEach(cell => {
            const promiseToFinish = cell.moveNumberToBin(shippingBox.element);
            cellFinishedBinningPromises.push(promiseToFinish);
            const percentageForThisNumber = Math.random() * (MAX_PERCENTAGE_PER_NUMBER - MIN_PERCENTAGE_PER_NUMBER) + MIN_PERCENTAGE_PER_NUMBER;
            percentageToBeAdded += percentageForThisNumber;
        })

        await Promise.all(cellFinishedBinningPromises).then(() => {
            this.closeBoxAnimation(shippingBox);
            setTimeout(() => {
                shippingBox.addToTotalPercent(Math.floor(percentageToBeAdded));
                this.updateTotalPercentage();
                this.paused = false;
                this.clearBoxAnimation(shippingBox);
            }, 500);
        });
    }

    updateTotalPercentage(): void {
        const total = Math.round(Object.values(this.ShippingBoxMap).reduce((prev, curr) => {
            prev += curr.percentage;
            return prev;
        }, 0) / 5);
        const totalPercentageElem = document.getElementById('total-percentage') as HTMLDivElement;
        if (!totalPercentageElem) {
            return;
        }
        totalPercentageElem.innerHTML = `${total}%`;
    }

    mouseMove(event: MouseEvent | TouchEvent) {
        if (
            ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0)
        ) {
            event = event as TouchEvent;
            this.mouseX = event.touches[0].clientX - this.offsetX;
            this.mouseY = event.touches[0].clientY - this.offsetY;
        } else {
            event = event as MouseEvent;
            this.mouseX = event.clientX - this.offsetX;
            this.mouseY = event.clientY - this.offsetY;
        }
        
        if (!this.mouseCurrentlyClicked) {
            return;
        }
        this.mouseClickPoints.push([this.mouseX, this.mouseY]);
        this.selectBoxes();
    }

    selectBoxes(): void {
        const boxes = this.Grid.filter(cell => cell.distanceFromMouse < CLICK_DISTANCE && !cell.selected);
        boxes.forEach(box => {
            box.selected = true;
        })
    }

    mouseUp(_: MouseEvent | TouchEvent): void {
        this.mouseCurrentlyClicked = false;
        if (
            ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0)
        ) {
            this.mouseX = 999999999;
            this.mouseY = 999999999;
        }
    }

    mouseDown(_: MouseEvent | TouchEvent): void {
        if (this.paused) {
            return;
        }
        this.Grid.filter(cell => cell.selected).forEach(cell => {
            cell.selected = false;
            cell.generateNumberShiftAnimation();
            //cell.pastWarmUpPeriod = false;
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
        this.fps = 1000 / diff;
        this.lastDrawDate = date;
      
        this.CHANGE_PER_FRAME = 10 / this.fps;
      
        // if (this.paused) {
        //   const noneMoving = !this.Grid.some(cell => cell.direction === Direction.TO_CONTAINER);
        //   if (noneMoving) {
        //       this.paused = false;
        //   }
        // }
        
        this.canvasContext.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.Grid.forEach(cell => cell.drawNumber(this.canvasContext, this.mouseX, this.mouseY));
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