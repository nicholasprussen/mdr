import { CircleDetails } from "../models/circle-details";
import { Coord } from "../models/coord";
import { Circumcenter } from "./circumcenter";
import { distance } from "./distance";
import { ThirdPositionOffsetFromAngle } from "./third-position-offset-from-angle";

export function BuildCircle(
    number: Coord,
    destination: Coord
): CircleDetails {
    const deltaX = (destination.x - number.x);
    const deltaY = (destination.y - number.y);
    let angleRadians = Math.atan2(deltaY, deltaX);

    let angleInDegrees = angleRadians * (180 / Math.PI);
    if (angleInDegrees < 0) {
        angleInDegrees += 360;
    }

    const extraCoord = ThirdPositionOffsetFromAngle(number, destination);

    const circleCenter = Circumcenter(number, extraCoord, destination);

    return {
        center: circleCenter,
        radius: distance(extraCoord.x, circleCenter.x, extraCoord.y, circleCenter.y),
        distance: distance(number.x, destination.x, number.y, destination.y),
        extraCoord: extraCoord
    };
}