import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSpeakerCardComponent } from './add-speaker-card.component';

describe('AddSpeakerCardComponent', () => {
  let component: AddSpeakerCardComponent;
  let fixture: ComponentFixture<AddSpeakerCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSpeakerCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSpeakerCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
