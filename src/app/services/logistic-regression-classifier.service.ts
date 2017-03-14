import { Injectable } from '@angular/core';
import {SpeakerStoreService} from "../stores/speaker-store.service";
import {Speaker} from "../models/speaker.model";
import {BehaviorSubject, Observable} from "rxjs";
import {LogisticRegressionClassification} from "../models/LogisticRegressionClassification.model";

import 'rxjs/add/operator/sampleTime';

// js ml library in assets
declare var ml: any;

const INTERVAL = 33; // ~30fps

@Injectable()
export class LogisticRegressionClassifierService {

  private speakers: Speaker[] = [];
  private classificationValve: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private classification$: Observable<LogisticRegressionClassification>;

  constructor(private speakerStore: SpeakerStoreService) {
    // TODO init in app.component?
    this.init();
  }

  public init() {
    this.speakerStore.speakers.subscribe((speakers) => this.speakers = speakers);
  }

  public feedClassifier(fftStream: Observable<Uint8Array>) {
    const classificationStream = fftStream
      .sampleTime(INTERVAL)
      .map((analyserFrame) => {
        let result = {};
        this.speakers.forEach((speaker) => {
          // TODO use a generated speaker id instead of name
          result[speaker.name] = speaker.classifier.predict(analyserFrame);
        });

        return result;
      });

    // create control valve for the stream (see: https://github.com/ReactiveX/rxjs/issues/1542)
    this.classification$ = this.classificationValve.switchMap(flow => flow ? classificationStream : Observable.never());
  }

  public start() {
    this.classificationValve.next(true);
  }

  public stop() {
    this.classificationValve.next(false);
  }

  public train() {
    // TODO import a linear algebra library

    let labelVector = [];
    let dataSet = [];
    let offSet = -100;

    // collect all speaker data
    this.speakers.forEach((speaker) => {
      dataSet = [...dataSet, ...speaker.analyserFrames];
      labelVector = [...labelVector, ...Array(speaker.analyserFrames.length).fill([0, 1])]
    });

    // create labelVectors for each speaker
    let i = 0;
    this.speakers.forEach((speaker) => {
      // copy the labelVector and splice in positive labels for the speaker's range of values
      speaker.dataSet = dataSet;
      speaker.labelVector = Object.assign([], labelVector).splice(i, i + speaker.analyserFrames.length, ...Array(speaker.analyserFrames.length).fill([1, 0]));
    });

    this.speakers.forEach((speaker) => {
      speaker.classifier = new ml.LogisticRegression({
        input: speaker.dataSet.map((frame: Uint8Array) => {
          return frame.map((value: number) => {
            return value + offSet;
          })
        }),
        label: speaker.labelVector,
        'n_in': speaker.analyserFrames[0].length,
        'n_out': speaker.labelVector[0].length
      });

      //TODO understand the effects of lr and epochs
      speaker.classifier.train({
        lr: 0.6,
        epochs: 2000
      });

    })
  }

}

