import { Coord } from "../models/coord"

export function ThirdPositionOffsetFromAngle(number: Coord, destination: Coord, angleDegrees: number = 10): Coord {
    const distanceX = Math.abs(number.x - destination.x);
    const distanceY = Math.abs(number.y - destination.y);
    if (distanceX < 200 && distanceY < 200) {
        angleDegrees = 1;
    }

    if (distanceX > 150 && distanceY < 400) {
        angleDegrees = 25
    }

    if (distanceX > 150 && distanceY <= 200 && distanceY > 350) {
        angleDegrees = 25
    }
    const radians = (angleDegrees * Math.PI) / 180;
    const dx = destination.x - number.x;
    const dy = destination.y - number.y;
    const distance = Math.sqrt(dx * dx + dy * dy) / 2;
    const h = distance * Math.tan(radians);

    const mx = (number.x + destination.x) / 2;
    const my = (number.y + destination.y) / 2;

    const slope = dx === 0 ? 0 : dy / dx;
    const perpendicularSlope = dx === 0 ? 0 : (dy === 0 ? Infinity : -1 / slope);

    const offsetX = h / Math.sqrt(1 + perpendicularSlope ** 2);
    const offsetY = (perpendicularSlope * h) / Math.sqrt(1 + perpendicularSlope ** 2);

    const possibleThirdPoints = [
        { x: mx + offsetX, y: my + offsetY }, // One possible P3
        { x: mx - offsetX, y: my - offsetY }, // The other possible P3
    ];
    
    if (slope >= 0) {
        return possibleThirdPoints.at(0) as Coord;
    } else {
        return possibleThirdPoints.at(1) as Coord;
    }
}