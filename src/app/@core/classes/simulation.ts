export class Simulation {

    _id?: string;

    simulationName: string;
    rebalancingMode: string;
    simulationType: string;
    rebalanceMethod: string;
    period: string;

    constructor() {
        this.rebalancingMode = 'single';
        this.simulationType = 'manual';
        this.simulationName = '';
        this.rebalanceMethod = '';
        this.period = '1D';
    }
}
