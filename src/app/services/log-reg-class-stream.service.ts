import { Injectable } from '@angular/core';
import {Subscription, ConnectableObservable} from "rxjs";
import {FftFrameStream} from "./fft-stream.service";

import 'rxjs/add/operator/sampleTime';
import {FftFrame} from "../models/fftFrame.model";
import {LogRegClassification} from "../models/logistic-regression-classification.model";

// js ml library in assets
declare var ml: any;

// TODO include in spec
const INTERVAL = 33; // ~30fps

@Injectable()
export class LogRegClassStreamService {

  constructor() { }

  create(fftFrameStream: FftFrameStream, interval: number) {
    return new LogRegClassStream(fftFrameStream, interval);
  }

}

export class LogRegClassStream {

  public classification$: ConnectableObservable<LogRegClassification>;
  private classifier: any;
  private connection: Subscription;

  constructor(public fftFrameStream: FftFrameStream, interval: number) {
    this.classification$ = fftFrameStream.fftFrame$
      .sampleTime(interval)
      .map((fftFrame: FftFrame) => {
        return this.classifier.predict([fftFrame]);
      })
      .publish();
  }

  public start() {
    if (!this.classifier) {
      console.error(new Error('Classifier needs to be trained.'));
      return;
    }
    if (!this.connection) {
      this.fftFrameStream.start();
      this.connection = this.classification$.connect();
    }

  }

  public stop() {
    if (this.connection) {
      this.fftFrameStream.stop();
      this.connection.unsubscribe();
      this.connection = undefined;
    }
  }

  public train(trainingData: FftFrame[], labelVector: number[][]) {

    // TODO include in classifierSpec
    let offSet = -100;

    this.classifier = new ml.LogisticRegression({
      input: trainingData.map((frame: Uint8Array) => {
        return frame.map((value: number) => {
          return value + offSet;
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

// public createClassifier() {
//   let classificationStream = this.fftStreamService.fft
//     .sampleTime(INTERVAL)
//     .map((analyserFrame) => {
//       let result = {};
//       this.speakers.forEach((speaker) => {
//         // TODO use a generated speaker id instead of name
//         result[speaker.name] = speaker.classifier.predict([analyserFrame]);
//       });
//
//       return result;
//     });
//
//   this.sourceSwitch.next(classificationStream);
// }

// public train() {
//   // TODO import a matrix
//
//   const label = {
//     match: [1,0],
//     noMatch: [0,1]
//   };
//
//   let labelVector: number[][] = [];
//   let allSamples: Uint8Array[] = [];
//   let offSet = -100;
//
//   // collect all speaker data and create a labelVector of the same length as allSamples, all set to "noMatch"
//   this.speakers.forEach((speaker) => {
//     allSamples = [...allSamples, ...speaker.analyserFrames];
//     labelVector = [...labelVector, ...Array(speaker.analyserFrames.length).fill(label.noMatch)]
//   });
//
//   // create labelVectors for each speaker by swapping all indexes corresponding to the speakers speech with "match"
//   let i = 0;
//   this.speakers.forEach((speaker) => {
//     // copy the labelVector and splice in positive labels for the speaker's range of values
//     speaker.dataSet = allSamples;
//     speaker.labelVector = Object.assign([], labelVector);
//     speaker.labelVector.splice(i, speaker.analyserFrames.length, ...Array(speaker.analyserFrames.length).fill(label.match));
//     i += speaker.analyserFrames.length;
//   });
//
//   this.speakers.forEach((speaker) => {
//     speaker.classifier = new ml.LogisticRegression({
//       input: speaker.dataSet.map((frame: Uint8Array) => {
//         return frame.map((value: number) => {
//           return value + offSet;
//         })
//       }),
//       label: speaker.labelVector,
//       'n_in': speaker.analyserFrames[0].length,
//       'n_out': speaker.labelVector[0].length
//     });
//
//     //TODO understand the effects of lr and epochs
//     speaker.classifier.train({
//       lr: 0.6,
//       epochs: 2000
//     });
//
//   })
// }
