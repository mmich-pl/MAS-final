import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressFormArrayComponent } from './address-form-array.component';

describe('AddressFormArrayComponent', () => {
  let component: AddressFormArrayComponent;
  let fixture: ComponentFixture<AddressFormArrayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddressFormArrayComponent]
    });
    fixture = TestBed.createComponent(AddressFormArrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
