import { Injectable } from '@angular/core';
import {Observable, ConnectableObservable, Subscription, BehaviorSubject, Subject, ReplaySubject} from "rxjs";
import {FftSpec} from "../models/fftSpec.model";
import {FftFrame} from "../models/fftFrame.model";
import {AnalyserNodeFeed} from "./analyser-node-feed";

const SAMPLE_RATE = 44100;

@Injectable()
export class FftFrameStream {

  private pipe: Subject<AnalyserNode> = new Subject();
  private connection: Subscription;
  private sourceSwitch$: ReplaySubject<Observable<FftFrame>> = new ReplaySubject(1);
  // TODO is the switch operator more appropriate here?
  public fftFrame$: Observable<FftFrame> = this.sourceSwitch$.switchMap(obs => obs).multicast(new Subject()).refCount();
  private liveFftFrame$: Observable<FftFrame>;

  private fftSpec: FftSpec;
  public analyser: AnalyserNode;
  private filteredBinCount: number;

  constructor(private analyserNodeFeed: AnalyserNodeFeed) {
    this.connection = analyserNodeFeed.$.subscribe(this.pipe);
  }

  get $() {
    return this.fftFrame$;
  }

  public startSampling(fftSpec: FftSpec) {
    // TODO set default filter and binCount. Only interval is required.
    this.fftSpec = fftSpec;
    // TODO if this is called multiple times will the old Observables stay in memory?
    this.liveFftFrame$ = this.pipe.switchMap((analyser: AnalyserNode) => {
      this.analyser = analyser;
      let fftFrame = new Uint8Array(analyser.frequencyBinCount);
      return Observable
        .interval(fftSpec.interval)
        .map(() => {
          analyser.getByteFrequencyData(fftFrame);
          return this.binFrequencies(this.filterFrequencies(fftFrame)); // return copy of fftFrame for this interval
        });
    });

    this.sourceSwitch$.next(this.liveFftFrame$);
  }

  feed(frames: FftFrame[]) {
    // TODO use a scheduler rather than .zip?
    let feedFftFrame$ = Observable
      .from(frames)
      .zip(Observable.interval(this.fftSpec.interval))
      .map((zipped: [FftFrame | number]) => {
        return zipped[0];
      })
      .do({
        complete: () => {
            console.log("completed");
            this.sourceSwitch$.next(this.liveFftFrame$);
          }
      }
    );

    this.sourceSwitch$.next(feedFftFrame$);
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
