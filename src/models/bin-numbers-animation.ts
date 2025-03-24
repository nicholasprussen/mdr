import { CircleDetails } from "./circle-details";
import { Coord } from "./coord";

export class BinNumbersAnimation {
    numberPos: Coord;
    midpointPos: Coord;
    boxPos: Coord;
    numToBoxDistance: number;
    circleDetails: CircleDetails;
    boxElement: HTMLElement;
    currentAngle: number;
    startingAngle: number;
    endingAngle: number;
    totalAngleCovered: number;
    anglePerFrame: number;
}