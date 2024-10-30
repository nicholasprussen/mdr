export class ShippingBox {
    private _element: HTMLElement;
    get element(): HTMLElement {
        return this._element;
    }

    private _callback: (event: MouseEvent, shippingBox: ShippingBox) => void;

    private _percentage: number = 0;
    get percentage(): number {
        return Math.round(this._percentage);
    }

    constructor(
        shippingBoxElement: HTMLElement,
        callback: (event: MouseEvent, shippingBox: ShippingBox) => void
    ) {
        this._element = shippingBoxElement;
        this._callback = callback;

        this.buildEventListener();
    }

    public addToTotalPercent(numToAdd: number): void {
        this._percentage += Math.round(numToAdd);
        if (this._percentage > 100) {
            this._percentage = 100;
        }
        this.updatePercentageVisually();
    }

    private updatePercentageVisually(): void {
        const percentageElement = this._element.shadowRoot?.querySelector('span.percent-num');
        if (!percentageElement) {
            return;
        }
        percentageElement.innerHTML = Math.round(this._percentage)?.toString();

        const percentageBackgroundEl = this._element.shadowRoot?.querySelector('div.box-progress-bar') as HTMLDivElement;
        if (!percentageBackgroundEl) {
            return;
        }
        percentageBackgroundEl.style.width = `${Math.round(this._percentage)?.toString()}%`; 
        console.log(percentageElement, this._percentage);
    }

    private boxClickHandler = (event: MouseEvent) => {
        //console.log(event.clientX, event.clientY);
        //this.addToTotalPercent(Math.random() * 20);
        this._callback(event, this);
    }

    private buildEventListener(): void {
        this._element.addEventListener('click', this.boxClickHandler.bind(this))
    }

    public destroy(): void {
        this._element?.removeEventListener('click', this.boxClickHandler);
    }
}