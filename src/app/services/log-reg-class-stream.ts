import {Injectable, OnDestroy} from '@angular/core';
import {Subscription, ConnectableObservable, Subject} from "rxjs";

import 'rxjs/add/operator/sampleTime';
import {FftFrame} from "../models/fftFrame.model";
import {LogRegClassification} from "../models/logistic-regression-classification.model";
import {FftFrameStream} from "./fft-frame-stream";
import {LogRegClassSpec} from "../models/logRegClassSpec.model";

// js ml library in assets
declare var ml: any;

// TODO include in spec
const INTERVAL = 33; // ~30fps

@Injectable()
export class LogRegClassStream implements OnDestroy{

  public classification$: ConnectableObservable<boolean>;
  private classifier: any;
  private connection: Subscription;
  private valve: Subscription;

  private spec: LogRegClassSpec = {
    interval: 33,
    offset: -100
  };

  constructor(public fftFrameStream: FftFrameStream) {

    let pipe: Subject<FftFrame> = new Subject();

    this.classification$ = pipe.sampleTime(this.spec.interval)
      .map((fftFrame: FftFrame) => {
        // TODO why is the prediction in a nested array?
        let prediction = this.classifier.predict([fftFrame])[0];
        // TODO why is the result the reverse of what I expect?
        return prediction[0] === Math.max(...prediction);
      })
      .distinctUntilChanged()
      .publish();

    this.connection = fftFrameStream.$.subscribe(pipe);

  }

  get $() {
    return this.classification$;
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }

  public setSpec(spec: LogRegClassSpec) {
    // TODO
  }

  public start() {
    if (!this.classifier) {
      console.error(new Error('Classifier needs to be trained.'));
      return;
    }
    if (!this.valve) {
      this.valve = this.classification$.connect();
    }

  }

  public stop() {
    if (this.valve) {
      this.valve.unsubscribe();
      this.valve = undefined;
    }
  }

  public train(trainingData: FftFrame[], labelVector: number[][]) {
    let mean = trainingData.reduce((acc, val) => {
      return acc + val.reduce((acc, val) => acc + val, 0);
    }, 0);

    this.classifier = new ml.LogisticRegression({
      input: trainingData.map((frame: Uint8Array) => {
        return frame.map((value: number) => {
          //return value + this.spec.offset;
          return value - mean / 2;
        })
      }),
      label: labelVector,
      'n_in': trainingData[0].length,
      'n_out': labelVector[0].length
    });

    //TODO understand the effects of lr and epochs
    this.classifier.train({
      lr: 0.6,
      epochs: 2000
    });

  }

}
