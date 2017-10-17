export class Simulation {

    _id?: string;

    simulationName: string;
    rebalancingMode: string;
    simulationType: string;
    rebalanceMethod: string;
    period: string;

    targetExpectedReturn: number;
    targetRisk: number;
    targetLiquidity: number;


    constructor(targetExpectedReturn, targetRisk, targetLiquidity) {
        this.rebalancingMode = 'single';
        this.simulationType = 'manual';
        this.simulationName = '';
        this.rebalanceMethod = '';
        this.period = '1D';

        this.targetExpectedReturn = targetExpectedReturn;
        this.targetRisk = targetRisk;
        this.targetLiquidity = targetLiquidity;
    }
}
