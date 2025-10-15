import { CaseFiles } from "../../constants";

export class SaveGame {
    private startupCompleted: boolean = false;
    private enableBootCodeAnimation: boolean = true;
    private enableBootLogoAnimation: boolean = true;
    private mdrSaveState: MDRSave;

    constructor() {}

    public createMDRSave(): void {

    }

    public loadMDRSave(): void {
        if (!window) {
            this.createMDRSave();
        }
        const existingSaveString: MDRSave = window?.indexedDB.?.getItem()
    }
}

export class MDRSave {
    fileName: string;
    mobile: boolean = false;
    completions: BoxCompletion[] = [];


    constructor(numOfBoxes: number = 5) {
        this.fileName = this.getRandomCaseName();
        this.completions = BoxCompletion.generateCompletions(numOfBoxes);
    }

    private getRandomCaseName(): string {
        return CaseFiles[(Math.floor(Math.random() * CaseFiles.length))];   
    }

    public setRandomCaseName(): void {
        this.fileName = this.getRandomCaseName();
    }

    public static createNewGameState(numOfBoxes: number = 5): MDRSave {
        const mdrSave: MDRSave = new MDRSave();
        mdrSave.setRandomCaseName();
        mdrSave.completions = BoxCompletion.generateCompletions(numOfBoxes);
        return mdrSave;
    }
}

export class BoxCompletion {
    boxNumber: number;
    percentage: number;

    public static generateCompletions(numOfCompletions: number): BoxCompletion[] {
        const completions: BoxCompletion[] = [];
        for (let i = 0; i < numOfCompletions; i++) {
            completions.push({
                boxNumber: i,
                percentage: 0.0
            });
        }
        return completions;
    }
}