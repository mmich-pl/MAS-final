import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitPanelComponent } from './submit-panel.component';

describe('SubmitPanelComponent', () => {
  let component: SubmitPanelComponent;
  let fixture: ComponentFixture<SubmitPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubmitPanelComponent]
    });
    fixture = TestBed.createComponent(SubmitPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
