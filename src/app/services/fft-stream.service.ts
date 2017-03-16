import { Injectable } from '@angular/core';
import {Observable, ConnectableObservable, Subscription} from "rxjs";
import {FftSpec} from "../models/fftSpec.model";
import {FftFrame} from "../models/fftFrame.model";


const SAMPLE_RATE = 44100;

@Injectable()
export class FftStreamService {

  private publicFftStream$: FftFrameStream;
  //private streamSpec: FftSpec = {binCount: 100, filter: {min: 50, max: 3000}};

  constructor() { }

  private createFftFrameStream(analyserNode$: Observable<AnalyserNode>, fftSpec: FftSpec) {
    return new FftFrameStream(analyserNode$, fftSpec);
  }

  getPrivateFftFrameStream(analyserNode$: Observable<AnalyserNode>, fftSpec: FftSpec) {
    return this.createFftFrameStream(analyserNode$, fftSpec);
  }

  /**
   * Get public analyser. First call must provide a mediaStream to initialise against.
   * */
  // TODO come up with a better singleton pattern
  getPublicFftFrameStream(analyserNode$?: Observable<AnalyserNode>, fftSpec?: FftSpec) {
    if (analyserNode$ || (analyserNode$ && !this.publicFftStream$)) {
      this.publicFftStream$ = this.createFftFrameStream(analyserNode$, fftSpec);
    }
    else if (!analyserNode$ && !this.publicFftStream$) {
      throw new Error('First call to getPublicFftFrameStream() must pass an Observable<MediaStream>');
    }

    return this.publicFftStream$;
  }

}

export class FftFrameStream {

  public fftFrame$: ConnectableObservable<FftFrame>;
  private analyser: AnalyserNode;
  private connection: Subscription;

  constructor(private analyserNode$: Observable<AnalyserNode>, private fftSpec: FftSpec) {
    this.fftFrame$ = analyserNode$.switchMap((analyser: AnalyserNode) => {
      this.analyser = analyser;
      let fftFrame = new FftFrame(analyser.frequencyBinCount);
      return Observable
        .interval(fftSpec.interval)
        .map(() => {
          analyser.getByteFrequencyData(fftFrame);
          return this.binFrequencies(this.filterFrequencies(fftFrame)); // return copy of fftFrame for this interval
        });
    }).publish();
  }

  start() {
    this.connection = this.fftFrame$.connect();
  }

  stop() {
    this.connection.unsubscribe();
  }

  private filterFrequencies(fft: FftFrame): FftFrame {
    return fft.filter((value: number, i: number) => {
      let binFrequency = i * SAMPLE_RATE / this.analyser.fftSize;
      return binFrequency > this.fftSpec.filter.min && binFrequency < this.fftSpec.filter.max;
    });
  }

  private binFrequencies(fft: FftFrame): FftFrame {
    if (fft.length <= this.fftSpec.binCount) return fft;
    const binSize = fft.length / this.fftSpec.binCount;
    // generate indexes to split bins on
    const binIndexes = Array.from(new Array(this.fftSpec.binCount), (x, i) => {
      return Math.round((i + 1) * binSize);
    });

    // put the average value in each bin
    let bins = new Uint8Array(this.fftSpec.binCount);
    binIndexes.reduce((prev, curr, index, array) => {
      let slice = fft.slice(prev, curr);
      // TODO figure out why sum works but mean is too low
      let mean = slice.reduce((prev, curr, index, array) => prev + curr, 0);
      bins[index] = mean;
      return curr;
    }, 0);

    return bins;
  }

}
