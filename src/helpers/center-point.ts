import { Coord } from "../interfaces/coord";

export function CenterPoint(x1: number, x2: number, y1: number, y2: number): Coord {
    return {
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2
    } as Coord
}