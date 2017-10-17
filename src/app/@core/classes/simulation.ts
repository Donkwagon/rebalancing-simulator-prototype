export class Simulation {

    _id?: string;

    simulationName: string;
    rebalancingMode: string;
    simulationType: string;
    rebalancingMethod: string;
    period: string;

    startDate: any;
    snapshotDate: any;

    targetExpectedReturn: number;
    targetRisk: number;
    targetLiquidity: number;


    constructor(targetExpectedReturn, targetRisk, targetLiquidity) {
        this.rebalancingMode = 'single';
        this.simulationType = 'manual';
        this.simulationName = '';
        this.rebalancingMethod = '';
        this.period = '1D';

        this.targetExpectedReturn = targetExpectedReturn;
        this.targetRisk = targetRisk;
        this.targetLiquidity = targetLiquidity;
    }
}
