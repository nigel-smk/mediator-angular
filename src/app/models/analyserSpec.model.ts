export interface AnalyserSpec {
  minBin?: number;
  maxBin?: number;
  filter?: AnalyserSpecFilter;
}

export interface AnalyserSpecFilter {
  max?: number;
  min?: number;
}
