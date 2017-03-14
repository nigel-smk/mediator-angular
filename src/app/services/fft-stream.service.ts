import { Injectable } from '@angular/core';
import {Observable, BehaviorSubject} from "rxjs";
import {AnalyserService} from "./analyser.service";

const SAMPLE_RATE = 44100;

@Injectable()
export class FftStreamService {

  private _analyser: AnalyserNode;
  private _fftResult: Uint8Array;
  private fft$: Observable<Uint8Array>;
  private fftValve: BehaviorSubject<boolean> = new BehaviorSubject(false);
  // TODO create streamSpec model
  private streamSpec: {binCount: number, filter: {min: number, max: number}} = {binCount: 10, filter: {min: 50, max: 3000}};

  // TODO this is connecting to the global AnalyserService Instance. Trouble?
  // Maybe the analyser just shouldn't get created in a service.
  constructor(private analyserService: AnalyserService) {
    this.init();
  }

  get fft() {
    return this.fft$;
  }

  setFftSize(size: number) {
    this._analyser.fftSize = size;
  }

  /**
   * Sets fft capture interval in ms
   * */
  setInterval(interval: number) {
    // TODO this might kill any current subscriptions thus requiring resubscriptions...
    // TODO I think you can use a switchmap to swap in the new observable
    this._createFftStream(interval);
  }

  start() {
    this.fftValve.next(true);
  }

  stop() {
    this.fftValve.next(false);
  }

  init() {
    this.analyserService.analyser.subscribe((analyser) => {
      this._analyser = analyser;
      this._fftResult = new Uint8Array(this._analyser.frequencyBinCount); // initialize fftResult array

      // initialize fftStream
      this._createFftStream(50);
    });
  }

  private _createFftStream(interval: number) {
    // create the fftStream
    const fftStream = Observable
      .interval(interval)
      .map(() => {
        this._analyser.getByteFrequencyData(this._fftResult);
        //return Object.assign([], this._fftResult); // return copy of _fftResult for this interval
        return this._binFrequencies(this._filterFrequencies(this._fftResult));
      });

    // create control valve for the stream (see: https://github.com/ReactiveX/rxjs/issues/1542)
    this.fft$ = this.fftValve.switchMap(flow => flow ? fftStream : Observable.never()).publish();
  }

  private _filterFrequencies(fft: Uint8Array): Uint8Array {
    return fft.filter((value: number, i: number) => {
      let binFrequency = i * SAMPLE_RATE / this._analyser.fftSize;
      return binFrequency > this.streamSpec.filter.min && binFrequency < this.streamSpec.filter.max;
    });
  }

  private _binFrequencies(fft: Uint8Array): Uint8Array {
    if (fft.length <= this.streamSpec.binCount) return fft;
    const binSize = fft.length / this.streamSpec.binCount;
    // generate indexes to split bins on
    const binIndexes = Array.from(new Array(this.streamSpec.binCount), (x, i) => {
      return Math.round((i + 1) * binSize);
    });

    // put the average value in each bin
    let bins = new Uint8Array(this.streamSpec.binCount);
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
