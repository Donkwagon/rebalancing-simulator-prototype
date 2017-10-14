import { RebalancingSimulatorPage } from './app.po';

describe('rebalancing-simulator App', () => {
  let page: RebalancingSimulatorPage;

  beforeEach(() => {
    page = new RebalancingSimulatorPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
