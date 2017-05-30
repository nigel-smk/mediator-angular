import {Injectable, OnDestroy} from '@angular/core';
import {Subscription, ConnectableObservable, Subject} from "rxjs";

import 'rxjs/add/operator/sampleTime';
import {FftFrame} from "../models/fftFrame.model";
import {LogRegClassification} from "../models/logistic-regression-classification.model";
import {FftFrameStream} from "./fft-frame-stream";
import {LogRegClassSpec} from "../models/logRegClassSpec.model";
import {SpeakerStoreService} from "../stores/speaker-store.service";
import {Speaker} from "../models/speaker.model";

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

  private speakers: Speaker[];
  private speaker: Speaker;

  private spec: LogRegClassSpec = {
    interval: 33,
    offset: -100
  };

  constructor(public fftFrameStream: FftFrameStream, public speakerStore: SpeakerStoreService) {

    let pipe: Subject<FftFrame> = new Subject();

    this.classification$ = pipe.sampleTime(this.spec.interval)
      .map((fftFrame: FftFrame) => {
        let threshold = this.speaker ? this.speaker.threshold : 0;
        let shiftedFftFrame = fftFrame.map((value) => value - threshold);
        // TODO why is the prediction in a nested array?
        let prediction = this.classifier.predict([shiftedFftFrame])[0];
        // TODO why is the result the reverse of what I expect?
        return prediction[0] === Math.max(...prediction);
      })
      .distinctUntilChanged()
      .publish();

    this.connection = fftFrameStream.$.subscribe(pipe);

    this.speakerStore.speakers.subscribe((speakers: Speaker[]) => {
      this.speakers = speakers;
    });

  }

  get $() {
    return this.classification$;
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }

  public setSpeaker(speaker: Speaker) {
    this.speaker = speaker;
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

  public train() {
    // TODO no speaker assigned error

    const label = {
      match: [1,0],
      noMatch: [0,1]
    };

    let labelVector: number[][] = [];
    let trainingData: Uint8Array[] = [];

    // collect all speaker data and create a labelVector indicating the samples of the given speaker
    this.speakers.forEach((speaker) => {
      trainingData = [...trainingData, ...speaker.voiceSample];
      if (speaker === this.speaker){
        labelVector = [...labelVector, ...Array(speaker.voiceSample.length).fill(label.match)]
      }
      else {
        labelVector = [...labelVector, ...Array(speaker.voiceSample.length).fill(label.noMatch)]
      }

    });

    this.classifier = new ml.LogisticRegression({
      input: trainingData.map((frame: Uint8Array) => {
        return frame.map((value: number) => {
          return value - this.speaker.threshold;
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
