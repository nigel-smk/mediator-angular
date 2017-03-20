import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FftSpecComponent } from './fft-spec.component';

describe('FftSpecComponent', () => {
  let component: FftSpecComponent;
  let fixture: ComponentFixture<FftSpecComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FftSpecComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FftSpecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
