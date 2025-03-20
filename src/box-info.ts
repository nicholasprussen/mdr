export class BoxInfo {
    public element: HTMLElement;
    public boundingBox: DOMRect;
    public centerX: number;
    public centerY: number;

    constructor(boxElement: HTMLElement) {
        this.element = boxElement;
        this.boundingBox = this.element.getBoundingClientRect();
        this.centerX = this.boundingBox.left + this.boundingBox.width / 2;
        this.centerY = this.boundingBox.top + this.boundingBox.height / 2;
    }
}