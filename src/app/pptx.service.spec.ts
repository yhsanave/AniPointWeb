import { TestBed } from '@angular/core/testing';

import { PptxService } from './pptx.service';

describe('PptxService', () => {
  let service: PptxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PptxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
