export function distance(x1: number, x2: number, y1: number, y2: number): number {
    const X = x2 - x1;
    const Y = y2 - y1;
    return Math.sqrt(X * X + Y * Y );
}