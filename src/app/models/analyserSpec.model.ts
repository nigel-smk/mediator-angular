export interface AnalyserSpec {
  filter?: AnalyserSpecFilter;
}

export interface AnalyserSpecFilter {
  max?: number;
  min?: number;
}
