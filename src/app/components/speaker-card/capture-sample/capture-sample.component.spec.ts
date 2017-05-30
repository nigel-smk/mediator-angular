import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptureSampleComponent } from './capture-sample.component';

describe('CaptureSampleComponent', () => {
  let component: CaptureSampleComponent;
  let fixture: ComponentFixture<CaptureSampleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaptureSampleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaptureSampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
