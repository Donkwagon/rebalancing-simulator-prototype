export class Portfolio {

    _id?: string;
    private: boolean;

    securities: any[];

    risk: number;
    expectedReturn: number;
    liquidity: number;

    totalValue: number;
    equityValue: number;
    cash: number;

    numPrivate: number;
    numPublic: number;

    constructor() {

    }
}
