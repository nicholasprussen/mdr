import { MAX_PRINTOUT_INTERVAL, MIN_PRINTOUT_INTERVAL } from "./constants";
import { startupText } from "./startup-text";

export class Startup {
    private displayText: string;
    private currentText: string[] = [];
    private allText = startupText;
    private startupContainer: HTMLDivElement;
    
    private completionPromise: ((value: void | PromiseLike<void>) => void) | null;

    private drawLoop: NodeJS.Timeout;

    constructor() {
        this.startupContainer = document.getElementById('startup-overlay-container') as HTMLDivElement;
    }

    start(): Promise<void> {
        const promiseToComplete = new Promise<void>((resolve) => {
            this.completionPromise = resolve;
        });
        if (this.startupContainer === null || this.startupContainer === undefined) {
            this.completionPromise?.();
            return promiseToComplete;
        }
        this.initializeDrawLoop();
        return promiseToComplete;
    }

    private getRandomInterval(): number {
        return Math.random() * (MAX_PRINTOUT_INTERVAL - MIN_PRINTOUT_INTERVAL) + MIN_PRINTOUT_INTERVAL;
    }

    private initializeDrawLoop(): void {
        this.drawLoop = setInterval(() => {
            if (this.currentText.length === this.allText.length) {
                clearInterval(this.drawLoop);
                this.finish();
                //this.completionPromise?.();
                console.log("Complete")
                return;
            }
            const currentIndex = this.currentText.length;
            this.currentText = this.allText.slice(0, currentIndex + 1);
            this.displayText = this.currentText.join("\n");
            this.draw();
            console.log(this.currentText)
            clearInterval(this.drawLoop);
            this.initializeDrawLoop();
        }, this.getRandomInterval());
    }

    private draw(): void {
        const startupOverlay = document.getElementById('startup-overlay');
        if (startupOverlay == null || startupOverlay == undefined) {
            throw new Error("Failed to activate startup");
        }
        startupOverlay.innerText = this.displayText;
    }

    private finish(): void {
        //this.startupContainer.style.display = 'none';
        this.completionPromise?.();
    }
}
