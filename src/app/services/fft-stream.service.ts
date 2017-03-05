import { Injectable } from '@angular/core';
import {UserMediaService} from "./user-media.service";
import {Observable, Subject} from "rxjs";
import {AnalyserService} from "./analyser.service";

@Injectable()
export class FftStreamService {

  // TODO create analyser service that exposes analyser's properties?

  private _analyser: AnalyserNode;
  private _fftResult: Uint8Array;
  private fft$: Observable<number[]>;
  private fftValve: Subject<boolean>;

  constructor(private userMedia: UserMediaService, private analyserService: AnalyserService) { }

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
    //
    // this.userMedia.streams.subscribe((stream: MediaStream) => {
    //   let audioCtx = new AudioContext();
    //   let source = audioCtx.createMediaStreamSource(stream);
    //   this._analyser = audioCtx.createAnalyser();
    //   source.connect(this._analyser); // connect analyser to mic input
    //   this._fftResult = new Uint8Array(this._analyser.frequencyBinCount); // initialize fftResult array
    //
    //   // initialize fftStream
    //   this._createFftStream(50);
    // });
  }

  private _createFftStream(interval: number) {
    // create the fftStream
    const fftStream = Observable
      .interval(interval)
      .map(() => {
        this._analyser.getByteFrequencyData(this._fftResult);
        return Object.assign([], this._fftResult); // return copy of _fftResult for this interval
      });

    // create control valve for the stream (see: https://github.com/ReactiveX/rxjs/issues/1542)
    this.fftValve = new Subject();
    this.fft$ = this.fftValve.switchMap(flow => flow ? fftStream : Observable.never());

    // initialize control valve to off
    this.fftValve.next(false);
  }

}
