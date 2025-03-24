import { Cell } from "../../cell";
import { Direction } from "../../direction";
import { distance } from "../../helpers/distance";
import { Animation } from "./animation";
import { AnimationType } from "./animation-type";

export class NumberShiftAnimation extends Animation {
    private direction: Direction;
    private changePerFrame: number;

    constructor(
        direction: Direction,
        cell: Cell,
        durationInMilliseconds: number,
        strict: boolean = true,
    ) {
        super(
            cell,
            AnimationType.NUMBER_SHIFT,
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            durationInMilliseconds,
            strict,
            0
        )
        this.direction = direction;
        switch (this.direction) {
            case Direction.EAST:
                this.destPos = {
                    x: this.cell.numBoundingBox.maxX,
                    y: this.cell.numPos.y
                };
                break;
            case Direction.WEST:
                this.destPos = {
                    x: this.cell.numBoundingBox.minX,
                    y: this.cell.numPos.y
                };
                break;
            case Direction.NORTH:
                this.destPos = {
                    x: this.cell.numPos.x,
                    y: this.cell.numBoundingBox.maxY
                };
                break;
            case Direction.SOUTH:
                this.destPos = {
                    x: this.cell.numPos.x,
                    y: this.cell.numBoundingBox.minY
                };
                break;
        }
        this.calculateChangePerFrame();

        this.completed = () => false;
    }

    private calculateChangePerFrame(): void {
        const distanceToCover = distance(this.cell.numPos.x, this.destPos.x, this.cell.numPos.y, this.destPos.y);
        this.changePerFrame = distanceToCover / (this.duration * this.cell.averageFramerateGetter());
    }

    public override updateNumberPosition(): void {
        let yNumSubPosition = this.cell.numPos.y;
        let xNumSubPosition = this.cell.numPos.x;
        switch (this.direction) {
            case Direction.NORTH: //North
                if (this.cell.pastNorthBoundingBox) {
                    this.direction = Direction.SOUTH;
                    yNumSubPosition += this.changePerFrame;
                } else {
                    yNumSubPosition -= this.changePerFrame;
                }
                break;
            case Direction.SOUTH: //South
                if (this.cell.pastSouthBoundingBox) {
                    this.direction = Direction.NORTH;
                    yNumSubPosition -= this.changePerFrame;
                } else {
                    yNumSubPosition += this.changePerFrame;
                }
                break;
            case Direction.WEST: //West
                if (this.cell.pastWestBoundingBox) {
                    this.direction = Direction.EAST;
                    xNumSubPosition += this.changePerFrame;
                } else {
                    xNumSubPosition -= this.changePerFrame;
                }
                break;
            case Direction.EAST: //East
                if (this.cell.pastEastBoundingBox) {
                    this.direction = Direction.WEST;
                    xNumSubPosition -= this.changePerFrame;
                } else {
                    xNumSubPosition += this.changePerFrame;
                }
                break;
        }
        this.cell.numPos = {
            x: xNumSubPosition,
            y: yNumSubPosition
        };
    }
}