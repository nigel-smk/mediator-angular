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
  public analyser: AnalyserNode;
  private connection: Subscription;
  private filteredBinCount: number;

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

  get interval() {
    return this.fftSpec.interval;
  }

  get binCount(): number {
    return this.filteredBinCount || this.fftSpec.binCount;
  }

  feed(frames: FftFrame[]) {
    let service = this;

    let feedFftFrame$ = Observable
      .from(frames)
      .zip(Observable.interval(this.fftSpec.interval))
      .map((zipped: [FftFrame | number]) => {
        return zipped[0];
      })
      .do(
      () => {console.log("next feedFrame")},
      () => {console.error("feedFrame error")},
      () => {
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
    let filtered = fft.filter((value: number, i: number) => {
      let binFrequency = i * SAMPLE_RATE / this.analyser.fftSize;
      return binFrequency > this.fftSpec.filter.min && binFrequency < this.fftSpec.filter.max;
    });

    this.filteredBinCount = filtered.length;

    return filtered;
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
