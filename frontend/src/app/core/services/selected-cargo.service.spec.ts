import { TestBed } from '@angular/core/testing';

import { SelectedCargoService } from './selected-cargo.service';

describe('SelectedCargoService', () => {
  let service: SelectedCargoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedCargoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
