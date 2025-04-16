import { Cell } from "./cell";
import { CaseFiles, CELL_SIZE, CLICK_DISTANCE, MAX_PERCENTAGE_PER_NUMBER, MIN_PERCENTAGE_PER_NUMBER } from "./constants";
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

    cellSize: number = 0;

    timeElapsed: number = 0;

    caseName: string = CaseFiles[(Math.floor(Math.random() * CaseFiles.length))];

    fileCompleted: boolean = false;

    constructor() {
        this.setCaseName();
        this.createCanvas();
        this.cellSize = this.generateCellSize();

        window.addEventListener('resize', this.resize.bind(this));
    }

    start(): void {
        this.createGrid();

        this.ShippingBoxMap = this.createShippingBoxes();
        console.log(this.ShippingBoxMap);

        this.lastDrawDate = new Date();
        this.animate(0);
    }

    setCaseName(): void {
        const caseFileElem = document.getElementById('case-file');
        if (caseFileElem == null) {
            return;
        }
        caseFileElem.innerText = this.caseName;
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

    generateCellSize(): number {
        return CELL_SIZE;
        // const canvasModifier = this.canvasWidth / 700;
        // console.log(this.canvasWidth);
        // let modifiedCellSize = CELL_SIZE * canvasModifier;
        // console.log(modifiedCellSize)
        // if (modifiedCellSize < CELL_SIZE) {
        //     modifiedCellSize = CELL_SIZE;
        // }
        // return modifiedCellSize;
    }

    createGrid(): void {
        this.gridWidth = Math.floor(this.canvasWidth / this.cellSize);
        this.gridHeight = Math.floor(this.canvasHeight / this.cellSize);

        this.marginX = (this.canvasWidth - (this.gridWidth * this.cellSize)) / 2;
        this.marginY = (this.canvasHeight - (this.gridHeight * this.cellSize)) / 2;

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
                let xLoc = this.marginX + (x * this.cellSize);
                let yLoc = this.marginY + (y * this.cellSize);
                const existing = gridCopy[index];
                if (existing !== null && existing !== undefined) {
                    this.Grid.push(gridCopy[index]);
                    this.Grid[index].resetNum(xLoc, yLoc);
                } else {
                    this.Grid.push(
                        new Cell(
                            xLoc,
                            yLoc,
                            this.cellSize,
                            () => this.CHANGE_PER_FRAME,
                            () => this.paused,
                            () => this.fps,
                            () => this.timeElapsed,
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
        const centerFlap = (shippingBox.element.shadowRoot?.querySelector('.shadow-middle') as HTMLDivElement);
        //leftFlap.style.animation = `500ms ease-in-out lid-left-close reverse`;
        //rightFlap.style.animation = `500ms ease-in-out lid-right-close reverse`;
        //centerFlap.style.animation = `500ms ease-in-out center-close reverse`
        leftFlap.setAttribute('open', 'true');
        rightFlap.setAttribute('open', 'true');
        centerFlap.setAttribute('open', 'true');
    }

    private closeBoxAnimation(shippingBox: ShippingBox): void {
        const leftFlap = (shippingBox.element.shadowRoot?.querySelector('.shadow-top-left') as HTMLDivElement);
        const rightFlap = (shippingBox.element.shadowRoot?.querySelector('.shadow-top-right') as HTMLDivElement);
        const centerFlap = (shippingBox.element.shadowRoot?.querySelector('.shadow-middle') as HTMLDivElement);
        //leftFlap.style.animation = `500ms ease-in-out lid-left-close normal`;
        //rightFlap.style.animation = `500ms ease-in-out lid-right-close normal`;
        //centerFlap.style.animation = `500ms ease-in-out center-close normal`
        leftFlap.setAttribute('open', 'false');
        rightFlap.setAttribute('open', 'false');
        centerFlap.setAttribute('open', 'false');
    }

    private clearBoxAnimation(shippingBox: ShippingBox): void {
        const leftFlap = (shippingBox.element.shadowRoot?.querySelector('.shadow-top-left') as HTMLDivElement);
        const rightFlap = (shippingBox.element.shadowRoot?.querySelector('.shadow-top-right') as HTMLDivElement);
        const centerFlap = (shippingBox.element.shadowRoot?.querySelector('.shadow-middle') as HTMLDivElement);
        //leftFlap.style.animation = ``;
        //rightFlap.style.animation = ``;
        //centerFlap.style.animation = ``;
        leftFlap.removeAttribute('open');
        rightFlap.removeAttribute('open');
        centerFlap.removeAttribute('open');
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
                //this.clearBoxAnimation(shippingBox);
            }, 1000);
        });
    }

    updateTotalPercentage(): void {
        let total = Math.floor(Object.values(this.ShippingBoxMap).reduce((prev, curr) => {
            prev += curr.percentage;
            return prev;
        }, 0) / 5);
        
        //update header
        const totalPercentageElem = document.getElementById('total-percentage') as HTMLDivElement;
        if (!totalPercentageElem) {
            return;
        }
        totalPercentageElem.innerHTML = `${total}%`;

        const totalPercentageFill = document.getElementById('header-percentage-mask') as HTMLDivElement;
        console.log(totalPercentageFill)
        if (!totalPercentageFill) {
            return;
        }
        const totalMinus10 = Math.max(0, (total - 10));
        totalPercentageFill.style.background = `linear-gradient(90deg, rgba(1, 4, 8, 0) 0%, rgba(1, 4, 8, 0) ${totalMinus10}%${total >= 100 ? '' : `, rgba(1, 4, 8, 1) ${total}%`})`;
        //totalPercentageFill.style.width = `${total}%`;

        if (total === 100) {
            const promptElem = document.getElementById('completion-prompt-container') as HTMLDivElement;
            if (promptElem == null) {
                return;
            }
            promptElem.style.display = 'block';
            promptElem.setAttribute('completed', 'true');
            promptElem.style.animation = '1s 1 ease-in-out expand-completion-prompt';

            setTimeout(() => {
                this.fileCompleted = true;
                promptElem.style.animation = '';
            }, 1000)
        }
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

    animate(timeStamp: number) {
        this.timeElapsed = timeStamp;
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
        this.Grid.forEach(cell => cell.drawNumber(this.canvasContext, this.mouseX, this.mouseY, this.timeElapsed));
        this.numFramesSinceReset++;
        this.totalFramesSinceAppStart++;
      
        if (this.fileCompleted) {
            return;
        }
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
        this.gridWidth =  Math.floor(this.canvasWidth / this.cellSize);
        this.gridHeight = Math.floor(this.canvasHeight / this.cellSize);
        this.marginY = (this.canvasHeight - (this.gridHeight * this.cellSize)) / 2;
        this.marginX = (this.canvasWidth - (this.gridWidth * this.cellSize)) / 2;
        this.buildCells(true);
    }
}