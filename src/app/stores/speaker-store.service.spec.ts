import { TestBed, inject } from '@angular/core/testing';
import { SpeakerStoreService } from './speaker-store.service';

describe('SpeakerStoreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpeakerStoreService]
    });
  });

  it('should ...', inject([SpeakerStoreService], (service: SpeakerStoreService) => {
    expect(service).toBeTruthy();
  }));
});
