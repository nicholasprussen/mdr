import { Cell } from "../../cell";
import { TOTAL_SECONDS_TO_BIN_NUMBER } from "../../constants";
import { BuildCircle } from "../../helpers/build-circle";
import { CenterPoint } from "../../helpers/center-point";
import { distance } from "../../helpers/distance";
import { CircleDetails } from "../circle-details";
import { Coord } from "../coord";
import { Animation } from "./animation";
import { AnimationType } from "./animation-type";

export class NumbersToBinAnimation extends Animation {
    private midpointPos: Coord;
    private circleDetails: CircleDetails;
    private currentAngle: number;
    private startingAngle: number;
    private endingAngle: number;
    private totalAngleCovered: number;
    private anglePerFrame: number;

    constructor(
        cell: Cell,
        box: HTMLElement,
        strict: boolean = false,
        acceptableBufferZone: number = 10
    ) {
        const targetBoxBoundingBox = box.getBoundingClientRect();
        super(
            cell,
            AnimationType.NUMBER_TO_BIN,
            cell.numPos,
            {
                x: targetBoxBoundingBox.left + (targetBoxBoundingBox.width / 2),
                y: targetBoxBoundingBox.top - 100
            },
            TOTAL_SECONDS_TO_BIN_NUMBER,
            strict,
            acceptableBufferZone
        )

        this.completed = () => {
            const distanceFromDest = distance(this.cell.numPos.x, this.destPos.x, this.cell.numPos.y, this.destPos.y);
            return distanceFromDest < this.acceptableBufferZone;
        }

        this.setup();
    }

    public setup(): void {
        this.circleDetails = BuildCircle(
            this.startPos,
            this.destPos
        );

        this.midpointPos = CenterPoint(this.startPos.x, this.destPos.x, this.startPos.y, this.destPos.y);

        this.startingAngle = Math.atan2(
            this.startPos.y - this.circleDetails.center.y,
            this.startPos.x - this.circleDetails.center.x);
        this.startingAngle = (this.startingAngle + 2 * Math.PI) % (2 * Math.PI);
        this.currentAngle = this.startingAngle;
        this.endingAngle = Math.atan2(
            this.destPos.y - this.circleDetails.center.y,
            this.destPos.x - this.circleDetails.center.x);
        this.endingAngle = (this.endingAngle + 2 * Math.PI) % (2 * Math.PI);
        this.totalAngleCovered = 0;
        if (this.startPos.x > this.destPos.x) {
            this.totalAngleCovered = this.startingAngle - this.endingAngle;
        } else {
            this.totalAngleCovered = this.endingAngle - this.startingAngle;
        }

        this.totalAngleCovered = (this.totalAngleCovered + 2 * Math.PI) % (2 * Math.PI);

        this.anglePerFrame = this.totalAngleCovered / (this.duration * this.cell.averageFramerateGetter());
    }

    public override updateNumberPosition(timeSinceAnimStarted: number, cell: Cell): void {
        let newPos: Coord = {
            x: this.circleDetails.center?.x + this.circleDetails?.radius * Math.cos(this.currentAngle),
            y: this.circleDetails?.center.y + this.circleDetails?.radius * Math.sin(this.currentAngle)
        };
        this.currentAngle += (this.startPos.x > this.destPos.x ? -(this.anglePerFrame) : this.anglePerFrame);
        cell.numPos = newPos;
    }
}