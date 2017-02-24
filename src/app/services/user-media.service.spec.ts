import { TestBed, inject } from '@angular/core/testing';
import { UserMediaService } from './user-media.service';

describe('UserMediaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserMediaService]
    });
  });

  it('should ...', inject([UserMediaService], (service: UserMediaService) => {
    expect(service).toBeTruthy();
  }));
});
