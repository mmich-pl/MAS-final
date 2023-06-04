import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadSectionComponent } from './load-section.component';

describe('LoadSectionComponent', () => {
  let component: LoadSectionComponent;
  let fixture: ComponentFixture<LoadSectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoadSectionComponent]
    });
    fixture = TestBed.createComponent(LoadSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
