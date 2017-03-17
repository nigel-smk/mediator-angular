import { TestBed, inject } from '@angular/core/testing';
import { LogisticRegressionClassifierService } from './logistic-regression-classifier.service';

describe('LogRegClassStreamService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LogisticRegressionClassifierService]
    });
  });

  it('should ...', inject([LogisticRegressionClassifierService], (service: LogisticRegressionClassifierService) => {
    expect(service).toBeTruthy();
  }));
});
