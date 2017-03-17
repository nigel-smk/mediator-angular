import { TestBed, inject } from '@angular/core/testing';
import { LogRegTrainerService } from './log-reg-trainer.service';

describe('LogRegTrainerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LogRegTrainerService]
    });
  });

  it('should ...', inject([LogRegTrainerService], (service: LogRegTrainerService) => {
    expect(service).toBeTruthy();
  }));
});
