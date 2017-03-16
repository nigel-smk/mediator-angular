export interface FftSpec {
  binCount: number,
  interval: number,
  filter: {
    min: number,
    max: number
  }
}
