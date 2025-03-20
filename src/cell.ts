import { CELL_SIZE, CHANCE_TO_MOVE, CHANGE_PER_FRAME, DEFAULT_FONT_SIZE, FRAMES_TO_FULL_SPEED, MAX_FONT_SIZE, MAX_WARM_UP_PERIOD, MOUSE_MAX_DISTANCE, TOTAL_SECONDS_TO_BIN_NUMBER, TRIGGER_DIRECTION_CHANGE_MARGIN } from "./constants";
import { Direction } from "./direction";
import { BuildCircle } from "./helpers/build-circle";
import { CenterPoint } from "./helpers/center-point";
import { distance } from "./helpers/distance";
import { BinNumbersAnimation } from "./interfaces/bin-numbers-animation";

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
    public direction: Direction | undefined;
    public previousDirection: Direction | undefined;
    private timeToWaitInMiliseconds: number = 0;

    public selected: boolean = false;

    private previousFontSize: number = 32;
    public distanceFromMouse: number = 9999999;

    public pastWarmUpPeriod: boolean = false;

    private NumBoundingBox: NumBoundingBox;
    private cellCenterX: number;
    private cellCenterY: number;

    private binNumberAnimation: BinNumbersAnimation | null = null;

    changePerFrame: () => number = () => CHANGE_PER_FRAME;
    averageFramerateGetter: () => number = () => 60;
    paused: () => boolean = () => false;

    log: boolean = false;

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

        this.direction = this.getInitialDirection();
        this.previousDirection = this.direction;
        this.log = log;
        if (this.log) {
            console.log(this)
        }
    }

    public setTargetBoxAndStartArcAnimation(targetBox: HTMLElement): void {
        this.binNumberAnimation = new BinNumbersAnimation();
        this.binNumberAnimation.boxElement = targetBox;
        const targetBoxBoundingBox = targetBox.getBoundingClientRect();
        this.binNumberAnimation.numberPos = {
            x: this.xNumSubPosition,
            y: this.yNumSubPosition
        };
        this.binNumberAnimation.boxPos = {
            x: targetBoxBoundingBox.left + (targetBoxBoundingBox.width / 2),
            y: targetBoxBoundingBox.top - 100
        }
        this.binNumberAnimation.circleDetails = BuildCircle(
            this.binNumberAnimation.numberPos,
            this.binNumberAnimation.boxPos
        );

        this.binNumberAnimation.midpointPos = CenterPoint(this.binNumberAnimation.numberPos.x, this.binNumberAnimation.boxPos.x, this.binNumberAnimation.numberPos.y, this.binNumberAnimation.boxPos.y);

        this.binNumberAnimation.startingAngle = Math.atan2(
            this.yNumSubPosition - this.binNumberAnimation.circleDetails.center.y,
            this.xNumSubPosition - this.binNumberAnimation.circleDetails.center.x);
        this.binNumberAnimation.startingAngle = (this.binNumberAnimation.startingAngle + 2 * Math.PI) % (2 * Math.PI);
        this.binNumberAnimation.currentAngle = this.binNumberAnimation.startingAngle;
        this.binNumberAnimation.endingAngle = Math.atan2(
            this.binNumberAnimation.boxPos.y - this.binNumberAnimation.circleDetails.center.y,
            this.binNumberAnimation.boxPos.x - this.binNumberAnimation.circleDetails.center.x);
        this.binNumberAnimation.endingAngle = (this.binNumberAnimation.endingAngle + 2 * Math.PI) % (2 * Math.PI);
        this.binNumberAnimation.totalAngleCovered = 0;
        if (this.binNumberAnimation.numberPos.x > this.binNumberAnimation.boxPos.x) {
            this.binNumberAnimation.totalAngleCovered = this.binNumberAnimation.startingAngle - this.binNumberAnimation.endingAngle;
        } else {
            this.binNumberAnimation.totalAngleCovered = this.binNumberAnimation.endingAngle - this.binNumberAnimation.startingAngle;
        }

        this.binNumberAnimation.totalAngleCovered = (this.binNumberAnimation.totalAngleCovered + 2 * Math.PI) % (2 * Math.PI);

        this.binNumberAnimation.anglePerFrame = this.binNumberAnimation.totalAngleCovered / (TOTAL_SECONDS_TO_BIN_NUMBER * this.averageFramerateGetter());
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

    private getInitialDirection(): Direction | undefined {
        const chance = Math.random();
        if (chance < CHANCE_TO_MOVE) {
            const direction = Math.floor(Math.random() * 4);
            this.timeToWaitInMiliseconds = Math.floor(Math.random() * MAX_WARM_UP_PERIOD);
            if (this.log) {
                console.log(this.timeToWaitInMiliseconds)
            }
            return direction;
        }
        return undefined;
    }

    private centerNumY(): void {
        this.yNumSubPosition = this.cellCenterY;
    }

    private centerNumX(): void {
        this.xNumSubPosition = this.cellCenterX;
    }

    private moveNumberTowardDestination(destinationX: number, destinationY: number, speedX: number, speedY: number): void {
        if (this.xNumSubPosition > destinationX) { //X
            this.xNumSubPosition -= speedX;
            if (this.xNumSubPosition < destinationX) {
                this.xNumSubPosition = destinationX;
            }
        } else if (this.xNumSubPosition < destinationX) {
            this.xNumSubPosition += speedX;
            if (this.xNumSubPosition > destinationX) {
                this.xNumSubPosition = destinationX;
            }
        }

        if (this.yNumSubPosition > destinationY) { //Y
            this.yNumSubPosition -= speedY;
            if (this.yNumSubPosition < destinationY) {
                this.yNumSubPosition = destinationY;
            }
        } else if (this.yNumSubPosition < destinationY) {
            this.yNumSubPosition += speedY;
            if (this.yNumSubPosition > destinationY) {
                this.yNumSubPosition = destinationY;
            }
        }
    }

    private moveNumberInArc() {
        if (!this.binNumberAnimation) return;
        this.xNumSubPosition = this.binNumberAnimation.circleDetails.center?.x + this.binNumberAnimation.circleDetails?.radius * Math.cos(this.binNumberAnimation.currentAngle);
        this.yNumSubPosition = this.binNumberAnimation.circleDetails?.center.y + this.binNumberAnimation.circleDetails?.radius * Math.sin(this.binNumberAnimation.currentAngle);
        this.binNumberAnimation.currentAngle += (this.binNumberAnimation.numberPos.x > this.binNumberAnimation.boxPos.x ? -(this.binNumberAnimation.anglePerFrame) : this.binNumberAnimation.anglePerFrame);
    }

    updateNumPos(framesSinceLastReset: number, totalFramesSinceAppStart: number): void {
        if (this.timeToWaitInMiliseconds > framesSinceLastReset && !this.pastWarmUpPeriod && !this.paused()) { //Return if we don't want you to move yet
            return;
        }

        let speed: number;
        const framesSinceAnimStarted = framesSinceLastReset - this.timeToWaitInMiliseconds;
        if (!this.pastWarmUpPeriod && framesSinceAnimStarted > 0 && framesSinceAnimStarted < FRAMES_TO_FULL_SPEED) {
            speed = this.changePerFrame() * (framesSinceAnimStarted / FRAMES_TO_FULL_SPEED);
        } else {
            this.pastWarmUpPeriod = true;
            speed = this.changePerFrame();
        }

        switch(this.direction) {
            case Direction.NORTH: //North
                if (this.pastNorthBoundingBox) {
                    this.direction = Direction.SOUTH;
                    this.yNumSubPosition += speed;
                } else {
                    this.yNumSubPosition -= speed;
                }
                break;
            case Direction.SOUTH: //South
                if (this.pastSouthBoundingBox) {
                    this.direction = Direction.NORTH;
                    this.yNumSubPosition -= speed;
                } else {
                    this.yNumSubPosition += speed;
                }
                break;
            case Direction.WEST: //West
                if (this.pastWestBoundingBox) {
                    this.direction = Direction.EAST;
                    this.xNumSubPosition += speed;
                } else {
                    this.xNumSubPosition -= speed;
                }
                break;
            case Direction.EAST: //East
                if (this.pastEastBoundingBox) {
                    this.direction = Direction.WEST;
                    this.xNumSubPosition -= speed;
                } else {
                    this.xNumSubPosition += speed;
                }
                break;
            case Direction.BACK_TO_CENTER: //Back to center
                if (this.xNumSubPosition === this.cellCenterX && this.yNumSubPosition === this.cellCenterY) {
                    return;
                }

                this.moveNumberTowardDestination(this.cellCenterX, this.cellCenterY, speed, speed);

                break;
            case Direction.TO_CONTAINER: //Destination
                if (this.binNumberAnimation === null) {
                    break;
                }
                
                if (distance(this.xNumSubPosition, this.binNumberAnimation.boxPos.x, this.yNumSubPosition, this.binNumberAnimation.boxPos.y) < 10) {
                    this.centerNumX();
                    this.centerNumY();
                    this.pastWarmUpPeriod = false;
                    this.timeToWaitInMiliseconds = totalFramesSinceAppStart + MAX_WARM_UP_PERIOD;
                    this.number = this.getRandomNumber();
                    this.direction = this.previousDirection;
                    this.selected = false;
                    this.binNumberAnimation = null;
                    return;
                }

                this.moveNumberInArc();
                break;
            //TODO: add direction for going straight down into box
        }
    }

    calculateDistanceToMouse(x1: number, y1: number, x2: number, y2: number): number {
        const X = x2 - x1;
        const Y = y2 - y1;
        return Math.sqrt(X * X + Y * Y );
    }

    getFontOpacity(totalFramesSinceAppStart: number): number {
        let opacity = 1;
        if (this.timeToWaitInMiliseconds === undefined || this.pastWarmUpPeriod || this.timeToWaitInMiliseconds < totalFramesSinceAppStart) {
            return opacity;
        }
        opacity = totalFramesSinceAppStart / this.timeToWaitInMiliseconds;
        return opacity;
    }

    /**
     * Modifies the previous font value when binning numbers to 
     * decrease the size of the font exponentially
     * @returns Modified font value
     */
    fontGoingIntoBinSizeMultiplier(): number {
        if (!this.binNumberAnimation) throw new Error("Shouldn't call this when animation undefined");
        const distanceToBin = distance(this.binNumberAnimation?.boxPos.x, this.xNumSubPosition, this.binNumberAnimation?.boxPos.y, this.yNumSubPosition);
        const progress = distanceToBin / this.binNumberAnimation.circleDetails.distance;
        const modifier = Math.exp(-0.005 * progress);
        return modifier * this.previousFontSize;
    }

    getFontSize(distance: number, selected: boolean): string {
        let upperLimit = MAX_FONT_SIZE;
        let maxDist = MOUSE_MAX_DISTANCE;
        if (selected) {
            if (this.binNumberAnimation) {
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
        framesSinceLastReset: number,
        totalFramesSinceAppStart: number,
        mouseX: number,
        mouseY: number
    ): void {
        if (this.direction != undefined) {
            this.updateNumPos(framesSinceLastReset, totalFramesSinceAppStart);
        }

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = `rgba(170, 243, 252, ${this.getFontOpacity(totalFramesSinceAppStart)})`;
        this.distanceFromMouse = this.calculateDistanceToMouse(this.xNumSubPosition, this.yNumSubPosition, mouseX, mouseY);
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