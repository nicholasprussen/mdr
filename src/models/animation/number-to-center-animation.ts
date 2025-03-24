import { Cell } from "../../cell";
import { MOVE_NUMBER_TO_CENTER_DURATION } from "../../constants";
import { distance } from "../../helpers/distance";
import { Animation } from "./animation";
import { AnimationType } from "./animation-type";

export class NumberToCenterAnimation extends Animation {
    private changePerFrame: number = 0;

    constructor(
        cell: Cell,
        strict: boolean = true,
    ) {
        super(
            cell,
            AnimationType.NUMBER_CENTER,
            cell.numPos,
            cell.cellCenter,
            MOVE_NUMBER_TO_CENTER_DURATION,
            strict,
            0
        )
        this.calculateChangePerFrame();

        this.completed = () => {
            return this.cell.numPos.x === this.destPos.x && this.cell.numPos.y === this.destPos.y;
        }
    }

    private calculateChangePerFrame(): void {
        const distanceToCenter = distance(this.startPos.x, this.destPos.y, this.startPos.y, this.destPos.y);
        this.changePerFrame = distanceToCenter / (this.duration * this.cell.averageFramerateGetter());
    }

    public override updateNumberPosition(_: Cell): void {
        let xNumSubPosition: number = this.cell.numPos.x;
        let yNumSubPosition: number = this.cell.numPos.y;
        if (xNumSubPosition > this.destPos.x) { //X
            xNumSubPosition -= this.changePerFrame;
            if (xNumSubPosition < this.destPos.x) {
                xNumSubPosition = this.destPos.x;
            }
        } else if (xNumSubPosition < this.destPos.x) {
            xNumSubPosition += this.changePerFrame;
            if (xNumSubPosition > this.destPos.x) {
                xNumSubPosition = this.destPos.x;
            }
        }

        if (yNumSubPosition > this.destPos.y) { //Y
            yNumSubPosition -= this.changePerFrame;
            if (yNumSubPosition < this.destPos.y) {
                yNumSubPosition = this.destPos.y;
            }
        } else if (yNumSubPosition < this.destPos.y) {
            yNumSubPosition += this.changePerFrame;
            if (yNumSubPosition > this.destPos.y) {
                yNumSubPosition = this.destPos.y;
            }
        }
        this.cell.numPos = {
            x: xNumSubPosition,
            y: yNumSubPosition
        }
    }
}