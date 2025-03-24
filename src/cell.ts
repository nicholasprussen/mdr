import { CELL_SIZE, CHANCE_TO_MOVE, CHANGE_PER_FRAME, DEFAULT_FONT_SIZE, MAX_FADE_IN_START_TIME, MAX_FONT_SIZE, MAX_NUMBER_ANIMATION_DURATION, MIN_FADE_IN_START_TIME, MIN_NUMBER_ANIMATION_DURATION, MOUSE_MAX_DISTANCE, TRIGGER_DIRECTION_CHANGE_MARGIN } from "./constants";
import { Direction } from "./direction";
import { Coord } from "./models/coord";
import { Animation } from "./models/animation/animation";
import { NumberFadeInAnimation } from "./models/animation/number-fade-in-animation";
import { AnimationType } from "./models/animation/animation-type";
import { NumberShiftAnimation } from "./models/animation/number-shift-animation";
import { NumberToCenterAnimation } from "./models/animation/number-to-center-animation";
import { NumbersToBinAnimation } from "./models/animation/numbers-to-bin-animation";
import { distance } from "./helpers/distance";

export type NumBoundingBox = {
    maxX: number,
    minX: number,
    maxY: number,
    minY: number
}

export type ContainerDestinationPos = {
    containerX: number,
    containerY: number
}

export class Cell {
    private number: number = this.getRandomNumber();
    private xPosInGrid: number | undefined;
    private yPosInGrid: number | undefined;
    private xNumSubPosition: number = 0;
    private yNumSubPosition: number = 0;

    public selected: boolean = false;

    private previousFontSize: number = 32;
    public distanceFromMouse: number = 9999999;

    private animation: Animation | null;

    private NumBoundingBox: NumBoundingBox;

    private cellCenterX: number;
    private cellCenterY: number;
    public get cellCenter(): Coord {
        return {
            x: this.cellCenterX,
            y: this.cellCenterY
        }
    }

    numberFinishedBinning: ((value: void | PromiseLike<void>) => void) | null;

    changePerFrame: () => number = () => CHANGE_PER_FRAME;
    averageFramerateGetter: () => number = () => 60;
    paused: () => boolean = () => false;

    log: boolean = false;

    public get numPos(): Coord {
        return {
            x: this.xNumSubPosition,
            y: this.yNumSubPosition
        }
    }

    public set numPos(pos: Coord) {
        this.xNumSubPosition = pos?.x;
        this.yNumSubPosition = pos?.y;
    }

    public get numBoundingBox(): NumBoundingBox {
        return this.NumBoundingBox;
    }

    _opacity: number = 0;
    public set opacity(opacity: number) {
        this._opacity = opacity;
    }
    get opacity(): number {
        return this._opacity;
    }

    constructor(
        xPosInGrid: number,
        yPosInGrid: number,
        changePerFrameGetter: () => number,
        pauseGetter: () => boolean,
        averageFramerateGetter: () => number,
        log: boolean
    ) {
        this.xPosInGrid = xPosInGrid;
        this.yPosInGrid = yPosInGrid;

        this.cellCenterX = this.xPosInGrid + (CELL_SIZE / 2);
        this.cellCenterY = this.yPosInGrid + (CELL_SIZE / 2);

        this.changePerFrame = changePerFrameGetter;
        this.paused = pauseGetter;
        this.averageFramerateGetter = averageFramerateGetter;

        this.NumBoundingBox = this.generateBoundingBox();

        this.centerNumY();
        this.centerNumX();

        this.generateNumberFadeInAnimation();

        this.log = log;
        if (this.log) {
            console.log(this)
        }
    }

    public resetNum(newX: number, newY: number): void {
        this.xPosInGrid = newX;
        this.yPosInGrid = newY;
        this.centerNumX();
        this.centerNumY();
    }

    private generateBoundingBox(): NumBoundingBox {
        return {
            minY: (this.yPosInGrid ?? 0) + TRIGGER_DIRECTION_CHANGE_MARGIN,
            maxY: (this.yPosInGrid ?? 0) + (CELL_SIZE - TRIGGER_DIRECTION_CHANGE_MARGIN),
            minX: (this.xPosInGrid ?? 0) + TRIGGER_DIRECTION_CHANGE_MARGIN,
            maxX: (this.xPosInGrid ?? 0) + (CELL_SIZE - TRIGGER_DIRECTION_CHANGE_MARGIN)
        }
    }

    get pastNorthBoundingBox(): boolean {
        return this.yNumSubPosition <= this.NumBoundingBox.minY;
    }

    get pastSouthBoundingBox(): boolean {
        return this.yNumSubPosition >= this.NumBoundingBox.maxY;
    }

    get pastWestBoundingBox(): boolean {
        return this.xNumSubPosition <= this.NumBoundingBox.minX;
    }

    get pastEastBoundingBox(): boolean {
        return this.xNumSubPosition >= this.NumBoundingBox.maxX;
    }

    private getRandomNumber(): number {
        return Math.floor(Math.random() * 10);
    }

    private generateNumberFadeInAnimation(): void {
        const timeToWaitBeforeFadeIn = Math.random() * (MAX_FADE_IN_START_TIME - MIN_FADE_IN_START_TIME) + MIN_FADE_IN_START_TIME;
        setTimeout(() => {
            this.animation = new NumberFadeInAnimation(this);
        }, (timeToWaitBeforeFadeIn * 1000))
    }

    public generateNumberShiftAnimation(): void {
        const chance = Math.random();
        if (chance > CHANCE_TO_MOVE) {
            this.animation = null;
            return;
        }
        const direction = Math.floor(Math.random() * 4);
        const duration = Math.random() * (MAX_NUMBER_ANIMATION_DURATION - MIN_NUMBER_ANIMATION_DURATION) + MIN_NUMBER_ANIMATION_DURATION;
        this.animation = new NumberShiftAnimation(
            direction as Direction,
            this,
            duration,
        );
    }

    public moveNumberToBin(boxElement: HTMLElement): Promise<void> {
        this.animation = new NumbersToBinAnimation(this, boxElement);
        const promiseToBin = new Promise<void>((resolve) => {
            this.numberFinishedBinning = resolve;
        });
        return promiseToBin;
    }

    private centerNumY(): void {
        this.yNumSubPosition = this.cellCenterY;
    }

    private centerNumX(): void {
        this.xNumSubPosition = this.cellCenterX;
    }

    updateNumPos(): void {
        if (this.selected && this.animation?.type === AnimationType.NUMBER_SHIFT) {
            this.animation = new NumberToCenterAnimation(this);
            return;
        }

        if (this.animation && !this.animation.completed()) {
            this.animation.updateNumberPosition(this);
        }

        if (!this.animation?.completed()) {
            return;
        }

        switch (this.animation.type) {
            case AnimationType.NUMBER_FADE_IN:
                this.animation = null;
                this.generateNumberShiftAnimation();
                break;
            case AnimationType.NUMBER_CENTER:
                this.animation = null;
                break;
            case AnimationType.NUMBER_TO_BIN:
                this.numberFinishedBinning?.();
                this.numberFinishedBinning = null;
                this.animation = null;
                this.fullResetNumber();
                break;
        }
    }

    public fullResetNumber(): void {
        this.number = this.getRandomNumber();
        this.opacity = 0;
        this.centerNumX();
        this.centerNumY();
        this.number = this.getRandomNumber();
        this.selected = false;
        this.animation = new NumberFadeInAnimation(this);
    }

    /**
     * Modifies the previous font value when binning numbers to 
     * decrease the size of the font exponentially
     * @returns Modified font value
     */
    fontGoingIntoBinSizeMultiplier(): number {
        if (!this.animation || this.animation?.type !== AnimationType.NUMBER_TO_BIN) throw new Error("Shouldn't call this when animation undefined");
        const progress = this.animation.distanceToDest / this.animation.originalDistanceToDest;
        const modifier = Math.exp(-0.005 * progress);
        return modifier * this.previousFontSize;
    }

    getFontSize(distance: number, selected: boolean): string {
        let upperLimit = MAX_FONT_SIZE;
        let maxDist = MOUSE_MAX_DISTANCE;
        if (selected) {
            if (this.animation?.type === AnimationType.NUMBER_TO_BIN) {
                this.previousFontSize = this.fontGoingIntoBinSizeMultiplier();
                return `${this.previousFontSize}px helvetica`;
            }
            if (this.previousFontSize === upperLimit) {
                return `${this.previousFontSize}px helvetica`;
            }
            this.previousFontSize += (this.changePerFrame() * 2);
            if (this.previousFontSize > upperLimit) {
                this.previousFontSize = upperLimit;
            }
            return `${this.previousFontSize}px helvetica`;
        } else {
            this.previousFontSize = DEFAULT_FONT_SIZE;
        }
        if (Number.isNaN(distance)) {
            this.previousFontSize = DEFAULT_FONT_SIZE;
            return `${this.previousFontSize}px helvetica`;
        }
        let diff = upperLimit - DEFAULT_FONT_SIZE;
        if (distance > maxDist) {
            return `${this.previousFontSize}px helvetica`;
        }
        let ratio = 1 - (distance / maxDist);
        this.previousFontSize = DEFAULT_FONT_SIZE + (diff * ratio);
        return `${this.previousFontSize}px helvetica`
    }

    drawNumber(
        ctx: CanvasRenderingContext2D,
        mouseX: number,
        mouseY: number
    ): void {
        if (this.animation != undefined) {
            this.updateNumPos();
        }

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = `rgba(170, 243, 252, ${this.opacity})`;
        this.distanceFromMouse = distance(this.xNumSubPosition, mouseX, this.yNumSubPosition, mouseY);
        ctx.font = this.getFontSize(this.distanceFromMouse, this.selected);
        ctx.fillText(this.number.toString(), this.xNumSubPosition, this.yNumSubPosition);

        //Use for showing arc of number to box
        // if (this.binNumberAnimation) {
        //     // Draw a circle
        //     // ctx.fillStyle = '#ffff00';
        //     // ctx.beginPath();
        //     // ctx.arc(this.binNumberAnimation.circleDetails?.center.x, this.binNumberAnimation.circleDetails?.center.y,this.binNumberAnimation.circleDetails?.radius, 0, 2 * Math.PI); // (x, y, radius, startAngle, endAngle)
        //     // ctx.fill();
        //     // ctx.closePath();

        //     ctx.fillStyle = '#ff00ff';
        //     ctx.beginPath();
        //     ctx.arc(this.binNumberAnimation.numberPos.x, this.binNumberAnimation.numberPos.y, 20, 0, 2 * Math.PI); // (x, y, radius, startAngle, endAngle)
        //     ctx.fill();
        //     ctx.closePath();

        //     ctx.fillStyle = '#ff00ff';
        //     ctx.beginPath();
        //     ctx.arc(this.binNumberAnimation.boxPos.x, this.binNumberAnimation.boxPos.y - 100, 20, 0, 2 * Math.PI); // (x, y, radius, startAngle, endAngle)
        //     ctx.fill();
        //     ctx.closePath();

        //     ctx.fillStyle = '#ff00ff';
        //     ctx.beginPath();
        //     ctx.arc(this.binNumberAnimation.circleDetails.extraCoord.x, this.binNumberAnimation.circleDetails?.extraCoord.y, 20, 0, 2 * Math.PI); // (x, y, radius, startAngle, endAngle)
        //     ctx.fill();
        //     ctx.closePath();

        //     ctx.fillStyle = '#0000ff';
        //     ctx.beginPath();
        //     ctx.arc(this.binNumberAnimation.midpointPos.x, this.binNumberAnimation.midpointPos.y, 20, 0, 2 * Math.PI); // (x, y, radius, startAngle, endAngle)
        //     ctx.fill();

        //     ctx.closePath();
        // }
    }
}