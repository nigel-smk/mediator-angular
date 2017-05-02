export interface AnalyserNodeSpec {
  fftSize?: number;
  frequencyBinCount?: number;
  minDecibels?: number;
  maxDecibels?: number;
  smoothingTimeConstant?: number;
}
