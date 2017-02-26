import { TestBed, inject } from '@angular/core/testing';
import { AddSpeakerCardService } from './add-speaker-card.service';

describe('AddSpeakerCardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AddSpeakerCardService]
    });
  });

  it('should ...', inject([AddSpeakerCardService], (service: AddSpeakerCardService) => {
    expect(service).toBeTruthy();
  }));
});
