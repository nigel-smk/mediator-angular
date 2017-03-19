import { Injectable } from '@angular/core';
import {Observable, ConnectableObservable, Subscription, BehaviorSubject} from "rxjs";
import {FftSpec} from "../models/fftSpec.model";
import {FftFrame} from "../models/fftFrame.model";
import {AnalyserNodeStreamService} from "./analyser-node-stream.service";

const SAMPLE_RATE = 44100;

@Injectable()
export class FftStreamService {

  constructor(private analyserNodeStream: AnalyserNodeStreamService) { }

  create(fftSpec: FftSpec, analyserNode$: Observable<AnalyserNode> = this.analyserNodeStream.createAnalyserNodeStream()) {
    return new FftFrameStream(analyserNode$, fftSpec);
  }

}

export class FftFrameStream {

  private sourceSwitch: BehaviorSubject<Observable<FftFrame>> = new BehaviorSubject(Observable.never());
  public fftFrame$: ConnectableObservable<FftFrame> = this.sourceSwitch.switchMap(obs => {
    return obs;
  }).publish();
  private liveFftFrame$: Observable<FftFrame>;
  private analyser: AnalyserNode;
  private connection: Subscription;

  constructor(private analyserNode$: Observable<AnalyserNode>, private fftSpec: FftSpec) {
    this.liveFftFrame$ = analyserNode$.switchMap((analyser: AnalyserNode) => {
      this.analyser = analyser;
      let fftFrame = new Uint8Array(analyser.frequencyBinCount);
      return Observable
        .interval(fftSpec.interval)
        .map(() => {
          analyser.getByteFrequencyData(fftFrame);
          return this.binFrequencies(this.filterFrequencies(fftFrame)); // return copy of fftFrame for this interval
        });
    });

    this.sourceSwitch.next(this.liveFftFrame$);
  }

  feed(frames: FftFrame[]) {
    let feedFftFrame$ = Observable.from(frames)
      .do(
      // TODO try passing just the onCompleted function named as such and see if onNext and onError can be removed.
      function onNext() {console.log("next feedFrame")},
      function onError() {console.error("feedFrame error")},
      function onCompleted() {
        console.log("completed");
        this.sourceSwitch.next(this.liveFftFrame$);
      }
    );

    this.sourceSwitch.next(feedFftFrame$);
  }

  live() {
    this.sourceSwitch.next(this.liveFftFrame$);
  }

  start() {
    if (!this.connection) this.connection = this.fftFrame$.connect();
  }

  stop() {
    if (this.connection) {
      this.connection.unsubscribe();
      this.connection = undefined;
    }

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
