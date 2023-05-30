import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrucksetSetupComponent } from './truckset-setup.component';

describe('TrucksetSetupComponent', () => {
  let component: TrucksetSetupComponent;
  let fixture: ComponentFixture<TrucksetSetupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrucksetSetupComponent]
    });
    fixture = TestBed.createComponent(TrucksetSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
