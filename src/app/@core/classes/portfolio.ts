export class Portfolio {

    _id?: string;
    simulationId: string;

    state: string; // INIT, PRI_DEALS, R_UPDATED, REBLANCED

    securities: any[];

    risk: number;
    expectedReturn: number;
    liquidity: number;

    targetExpectedReturn: number;
    targetRisk: number;
    targetLiquidity: number;

    totalValue: number;
    equityValue: number;
    cash: number;

    numPrivate: number;
    numPublic: number;

    date: any;

    diffs: any;

    constructor(simulation) {
        this.simulationId = simulation._id;
        this.targetExpectedReturn = simulation.targetExpectedReturn;
        this.targetRisk = simulation.targetRisk;
        this.targetLiquidity = simulation.targetLiquidity;
    }
}
