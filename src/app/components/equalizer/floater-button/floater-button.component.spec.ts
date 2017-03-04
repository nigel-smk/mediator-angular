import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FloaterButtonComponent } from './floater-button.component';

describe('FloaterButtonComponent', () => {
  let component: FloaterButtonComponent;
  let fixture: ComponentFixture<FloaterButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FloaterButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FloaterButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
