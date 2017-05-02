import {FftFilterSpec} from "./fftFilterSpec.model";

export interface FftSpec {
  binCount?: number;
  interval?: number;
  filter?: FftFilterSpec;
}
