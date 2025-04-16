export class StartupAnimation {
    private completionPromise: ((value: void | PromiseLike<void>) => void) | null;

    constructor() {}

    start(): Promise<void> {
        const promiseToComplete = new Promise<void>((resolve) => {
            this.completionPromise = resolve;
        });
        this.loadAnimation();
        return promiseToComplete;
    }

    private loadAnimation(): void {
        let container = document.getElementById('startup-animation-container') as HTMLDivElement;
        container.style.display = 'flex';

        let animationContainer = document.getElementById('startup-animation') as HTMLDivElement;
        fetch('assets/img/lumon-logo.svg')
            .then(response => response.text())
            .then(svgText => {
                animationContainer.innerHTML = svgText
                setTimeout(() => {
                    (document.getElementById('startup-overlay-container') as HTMLDivElement).style.display = 'none';
                    this.completionPromise?.();
                }, 6500)
            });
    }
}