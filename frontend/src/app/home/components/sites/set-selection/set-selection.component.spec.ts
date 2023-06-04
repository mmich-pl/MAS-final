import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetSelectionComponent } from './set-selection.component';

describe('TrucksetSetupComponent', () => {
  let component: SetSelectionComponent;
  let fixture: ComponentFixture<SetSelectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SetSelectionComponent]
    });
    fixture = TestBed.createComponent(SetSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
