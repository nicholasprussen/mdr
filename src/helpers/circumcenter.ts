import { Coord } from "../interfaces/coord";

export function Circumcenter(p1: Coord, p2: Coord, p3: Coord): Coord {
    const a = p2.x - p1.x;
    const b = p2.y - p1.y;
    const c = p3.x - p1.x;
    const d = p3.y - p1.y;
    const e = a * (p1.x + p2.x) + b * (p1.y + p2.y);
    const f = c * (p1.x + p3.x) + d * (p1.y + p3.y);
    const g = 2 * (a * d - b * c);
    if (g === 0) throw Error(); // Points are collinear, no circumcenter exists
    const cx = (d * e - b * f) / g;
    const cy = (a * f - c * e) / g;
    return { x: cx, y: cy };
}