import { Cell } from "../../cell";
import { distance } from "../../helpers/distance";
import { Coord } from "../coord";
import { AnimationType } from "./animation-type";

export class Animation {
    protected cell: Cell;
    protected _type: AnimationType;
    protected startPos: Coord;
    protected destPos: Coord;
    protected duration: number;
    protected strict: boolean;
    protected acceptableBufferZone: number;

    public get type(): AnimationType {
        return this._type;
    }

    public get distanceToDest(): number {
        return distance(this.cell.numPos.x, this.destPos.x, this.cell.numPos.y, this.destPos.y);
    }

    public get originalDistanceToDest(): number {
        return distance(this.startPos.x, this.destPos.x, this.startPos.y, this.destPos.y);
    }

    public get durationInSeconds(): number { 
        return this.duration;
    }

    completed: () => boolean;

    constructor(
        cell: Cell,
        type: AnimationType,
        startPos: Coord,
        destPos: Coord,
        duration: number,
        strict: boolean = true,
        acceptableBufferZone: number = 0
    ) {
        this.cell = cell;
        this._type = type;
        this.startPos = startPos;
        this.destPos = destPos;
        this.duration = duration;
        this.strict = strict;
        this.acceptableBufferZone = acceptableBufferZone;

        this.completed = () => {
            throw new Error("Not Implemented")
        };
    }

    public updateNumberPosition(timeSinceAnimStarted: number, cell: Cell): void {
        throw new Error("Method not imlpemented");
    };

    protected easeInOutSine(progress: number): number {
        return -(Math.cos(Math.PI * progress) - 1) / 2;
    }

    protected easeInOutCubic(progress: number): number {
        return progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;
    }
}