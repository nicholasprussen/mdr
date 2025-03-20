export function Slope(x1: number, x2: number, y1: number, y2: number): number {
    const deltaY = y2 - y1;
    const deltaX = x2 - x1;

    if (x1 === x2) {
        throw new Error("Slope is undefined");
    }

    return deltaY / deltaX;
}