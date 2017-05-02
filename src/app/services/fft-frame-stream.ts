import {Injectable, OnDestroy} from '@angular/core';
import {Observable, Subscription, Subject, ReplaySubject} from "rxjs";
import {FftFrame} from "../models/fftFrame.model";
import {AnalyserNodeFeed} from "./analyser-node-feed";
import {FftSpec} from "../models/fftSpec.model";

const SAMPLE_RATE = 44100;

@Injectable()
export class FftFrameStream implements OnDestroy {

  private connection: Subscription;
  private sourceSwitch$: ReplaySubject<Observable<FftFrame>> = new ReplaySubject(1);
  private specSwitch$: ReplaySubject<Observable<FftFrame>> = new ReplaySubject(1);

  // TODO use publish to gain control over when the stream starts and stops
  public fftFrame$: Observable<FftFrame> = this.sourceSwitch$.switch().multicast(new Subject()).refCount();
  private liveFftFrame$: Observable<FftFrame> = this.specSwitch$.switch();

  public analyser: AnalyserNode;
  private filteredBinCount: number;
  private spec: FftSpec = {
    interval: 16,
    binCount: null,
    filter: {
      min: 50,
      max: 3000
    }
  };

  constructor(private analyserNodeFeed: AnalyserNodeFeed) {

    // TODO initialize in a more intuitive way

    let pipe: Subject<AnalyserNode> = new Subject();

    let conditionalObservable: Observable<Observable<FftFrame>> = pipe.switchMap((analyserNode: AnalyserNode) => {
      this.analyser = analyserNode;
      if (this.spec !== undefined) {
        return Observable.of(this.createFftFrameObservable());
      }
      else {
        return Observable.never();
      }
    });

    conditionalObservable.subscribe(this.specSwitch$);

    this.connection = analyserNodeFeed.$.subscribe(pipe);

    this.sourceSwitch$.next(this.liveFftFrame$);

  }

  get $() {
    return this.fftFrame$;
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }

  public getSpec() {
    return Object.assign({}, this.spec);
  }

  public setSpec(spec: FftSpec) {
    // TODO set default filter and binCount. Only interval is required.
    Object.assign(this.spec, spec);
    this.specSwitch$.next(this.createFftFrameObservable());
  }

  public startSampling() {
    if (this.spec === undefined) {
      // TODO raise an error
    }

    this.sourceSwitch$.next(this.liveFftFrame$);
  }

  public feed(frames: FftFrame[]) {
    // TODO use a scheduler rather than .zip?
    let feedFftFrame$ = Observable
      .from(frames)
      .zip(Observable.interval(this.spec.interval))
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

  private createFftFrameObservable() {
    // TODO check for spec.interval
    let fftFrame = new Uint8Array(this.analyser.frequencyBinCount);
    return Observable
      .interval(this.spec.interval)
      .map(() => {
        this.analyser.getByteFrequencyData(fftFrame);
        return this.binFrequencies(this.filterFrequencies(fftFrame)); // return copy of fftFrame for this interval
      });
  }

  private filterFrequencies(fft: FftFrame): FftFrame {
    let filtered = fft.filter((value: number, i: number) => {
      let binFrequency = i * SAMPLE_RATE / this.analyser.fftSize;
      return binFrequency > this.spec.filter.min && binFrequency < this.spec.filter.max;
    });

    this.filteredBinCount = filtered.length;

    return filtered;
  }

  private binFrequencies(fft: FftFrame): FftFrame {
    if (this.spec.binCount == null) return fft;
    if (fft.length <= this.spec.binCount) return fft;
    const binSize = fft.length / this.spec.binCount;
    // generate indexes to split bins on
    const binIndexes = Array.from(new Array(this.spec.binCount), (x, i) => {
      return Math.round((i + 1) * binSize);
    });

    // put the average value in each bin
    let bins = new Uint8Array(this.spec.binCount);
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
