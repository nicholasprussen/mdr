import { Cell } from "../../cell";
import { Direction } from "../../direction";
import { Coord } from "../coord";
import { Animation } from "./animation";
import { AnimationType } from "./animation-type";

export class NumberShiftAnimation extends Animation {
    public direction: Direction;
    private progress: number = 0;
    private _toCenter: boolean = false;
    private set toCenter(toCenter: boolean) {
        this._toCenter = toCenter;
    }
    public get toCenter(): boolean {
        return this._toCenter;
    }

    constructor(
        direction: Direction,
        cell: Cell,
        durationInMilliseconds: number,
        strict: boolean = true,
        toCenter: boolean = false
    ) {
        super(
            cell,
            AnimationType.NUMBER_SHIFT,
            { x: cell.numPos.x, y: cell.numPos.y },
            { x: 0, y: 0 },
            durationInMilliseconds,
            strict,
            0
        )
        this.toCenter = toCenter;
        this.destPos = this.getDestPos(direction, cell, toCenter);
        this.direction = toCenter ? this.getToCenterDirection() : direction;
        if (this.cell.log) {
            console.log(this.direction, this.destPos, this.startPos, this.cell.cellCenter)
        }
        this.completed = () => {
            return this.progress === 1;
        }
    }

    private getToCenterDirection(): Direction {
        if (this.startPos.x < this.destPos.x) {
            return Direction.EAST;
        }
        if (this.startPos.x > this.destPos.x) {
            return Direction.WEST;
        }
        if (this.startPos.y < this.destPos.y) {
            return Direction.SOUTH;
        }
        if (this.startPos.y < this.destPos.y) {
            return Direction.NORTH;
        }
        //This means it's already at the spot. Give a random direction
        return Direction.NORTH;
        throw new Error("Could not determine direction for center");
    }

    private getDestPos(direction: Direction, cell: Cell, toCenter: boolean = false): Coord {
        if (toCenter) {
            return this.cell.cellCenter
        }
        switch (direction) {
            case Direction.EAST:
                return {
                    x: cell.numBoundingBox.maxX,
                    y: cell.numPos.y
                };
            case Direction.WEST:
                return {
                    x: cell.numBoundingBox.minX,
                    y: cell.numPos.y
                };
            case Direction.NORTH:
                return {
                    x: cell.numPos.x,
                    y: cell.numBoundingBox.minY
                };
            case Direction.SOUTH:
                return {
                    x: cell.numPos.x,
                    y: cell.numBoundingBox.maxY
                };
        }
        throw new Error("Unsupported direction")
    }

    public override updateNumberPosition(timeSinceAnimStarted: number): void {
        if (this.progress === 1) {
            return;
        }
        let yNumSubPosition = this.cell.numPos.y;
        let xNumSubPosition = this.cell.numPos.x;
        const progress = Math.min(timeSinceAnimStarted / (this.duration * 1000), 1);
        if (this.cell.log) {
            // console.log(progress)
        }
        const easedProgress = this.easeInOutSine(progress);
        this.progress = easedProgress;
        switch (this.direction) {
            case Direction.NORTH:
                yNumSubPosition = this.startPos.y + ((this.destPos.y - this.startPos.y) * easedProgress);
                break;
            case Direction.SOUTH:
                yNumSubPosition = this.startPos.y + ((this.destPos.y - this.startPos.y) * easedProgress);
                break;
            case Direction.EAST:
                xNumSubPosition = this.startPos.x + ((this.destPos.x - this.startPos.x) * easedProgress);
                break;
            case Direction.WEST:
                xNumSubPosition = this.startPos.x + ((this.destPos.x - this.startPos.x) * easedProgress);
                break;
        }
        this.cell.numPos = {
            x: xNumSubPosition,
            y: yNumSubPosition
        };
    }
}