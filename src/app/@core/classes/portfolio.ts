export class Portfolio {

    _id?: string;
    simulationId: string;

    state: string; // INIT, PRI_DEALS, R_UPDATED, REBLANCED

    securities: any[];

    diffPrivateAdded: any[];
    diffPrivateRemoved: any[];
    diffPublicAdded: any[];
    diffPublicRemoved: any[];

    risk: number;
    expectedReturn: number;
    liquidity: number;

    targetExpectedReturn: number;
    targetRisk: number;
    targetLiquidity: number;

    discrepancyExpectedReturn: number;
    discrepancyLiquidity: number;
    discrepancyRisk: number;

    rebalancedExpectedReturn: number;
    rebalancedLiquidity: number;
    rebalancedRisk: number;

    totalValue: number;
    equityValue: number;
    privateEquityValue: number;
    publicEquityValue: number;
    cash: number;

    numPrivate: number;
    numPublic: number;

    date: any;
    dateTimestamp: number;

    diffs: any;

    constructor(simulation) {
        this.simulationId = simulation._id;
        this.targetExpectedReturn = simulation.targetExpectedReturn;
        this.targetRisk = simulation.targetRisk;
        this.targetLiquidity = simulation.targetLiquidity;

        this.diffPrivateAdded = [];
        this.diffPrivateRemoved = [];
        this.diffPublicAdded = [];
        this.diffPublicRemoved = [];
    }
}
