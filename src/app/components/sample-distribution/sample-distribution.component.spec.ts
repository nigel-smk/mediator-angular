import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleDistributionComponent } from './sample-distribution.component';

describe('SampleDistributionComponent', () => {
  let component: SampleDistributionComponent;
  let fixture: ComponentFixture<SampleDistributionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SampleDistributionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleDistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
