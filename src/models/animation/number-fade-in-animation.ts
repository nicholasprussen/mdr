import { Cell } from "../../cell";
import { MAX_FADE_IN_DURATION, MIN_FADE_IN_DURATION } from "../../constants";
import { Animation } from "./animation";
import { AnimationType } from "./animation-type";

export class NumberFadeInAnimation extends Animation {
    private previousOpacity: number = 0;
    private changePerFrame: number = 0;

    constructor(
        cell: Cell,
    ) {
        super(
            cell,
            AnimationType.NUMBER_FADE_IN,
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            0,
            undefined,
            undefined
        )
        
        this.completed = () => {
            return this.previousOpacity >= 1;
        }

        this.duration = Math.random() * (MAX_FADE_IN_DURATION - MIN_FADE_IN_DURATION) + MIN_FADE_IN_DURATION;
        this.calculateChangePerFrame();
    }

    private calculateChangePerFrame(): void {
        const amountLeft = 1 - this.previousOpacity;
        this.changePerFrame = amountLeft / (this.duration * this.cell.averageFramerateGetter());
    }

    public override updateNumberPosition(_: Cell): void {
        let nextOpacity = this.previousOpacity + this.changePerFrame;
        if (nextOpacity > 1) {
            nextOpacity = 1;
        }
        this.previousOpacity = nextOpacity;
        this.cell.opacity = this.previousOpacity;
    }
}