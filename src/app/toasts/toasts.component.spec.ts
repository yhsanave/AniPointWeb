import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppToastsComponent } from './toasts.component';

describe('ToastsComponent', () => {
  let component: AppToastsComponent;
  let fixture: ComponentFixture<AppToastsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppToastsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppToastsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
