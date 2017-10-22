import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulationsOverallComponent } from './simulations-overall.component';

describe('SimulationsOverallComponent', () => {
  let component: SimulationsOverallComponent;
  let fixture: ComponentFixture<SimulationsOverallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimulationsOverallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimulationsOverallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
