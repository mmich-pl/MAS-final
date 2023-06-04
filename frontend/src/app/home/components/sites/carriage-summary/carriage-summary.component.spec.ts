import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarriageSummaryComponent } from './carriage-summary.component';

describe('TrucksetSetupComponent', () => {
  let component: CarriageSummaryComponent;
  let fixture: ComponentFixture<CarriageSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CarriageSummaryComponent]
    });
    fixture = TestBed.createComponent(CarriageSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
