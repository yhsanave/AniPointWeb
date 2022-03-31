import { TestBed } from '@angular/core/testing';

import { ToastService } from './toasts.service';

describe('ToastsService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
