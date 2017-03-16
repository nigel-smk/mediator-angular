import { Injectable } from '@angular/core';
import {SpeakerStoreService} from "../stores/speaker-store.service";
import {Speaker} from "../models/speaker.model";
import {Observable, Subscription, ConnectableObservable, BehaviorSubject} from "rxjs";
import {LogRegClassification} from "../models/LogisticRegressionClassification.model";
import {FftStreamService, FftFrameStream} from "./fft-stream.service";

import 'rxjs/add/operator/sampleTime';
import {FftFrame} from "../models/fftFrame.model";

// js ml library in assets
declare var ml: any;

// TODO figure out how to set interval dynamically using a switchMap
const INTERVAL = 33; // ~30fps

@Injectable()
export class LogisticRegressionClassifierService {

  private publicClassificationStream: ClassificationStream;

  constructor() { }

  private createClassificationStream(fftFrameStream: FftFrameStream, interval: number) {
    return new FftFrameStream(fftFrameStream);
  }

  getPrivateFftFrameStream(analyserNode$: Observable<AnalyserNode>) {
    return this.createFftFrameStream(analyserNode$);
  }

  /**
   * Get public classification stream. First call must provide a mediaStream to initialise against.
   * */
  // TODO come up with a better singleton pattern
  getPublicFftFrameStream(analyserNode$?: Observable<AnalyserNode>, interval?: number) {
    if (analyserNode$ || (analyserNode$ && !this.publicFftStream$)) {
      this.publicFftStream$ = this.createFftFrameStream(analyserNode$, fftSpec);
    }
    else if (!analyserNode$ && !this.publicFftStream$) {
      throw new Error('First call to getPublicFftFrameStream() must pass an Observable<MediaStream>');
    }

    return this.publicFftStream$;
  }

}

export class ClassificationStream {

  private classification$: ConnectableObservable<LogRegClassification>;
  private classifier: any;
  private connection: Subscription;

  constructor(private fftFrameStream: FftFrameStream, interval: number) {
    this.classification$ = fftFrameStream.fftFrame$
      .sampleTime(interval)
      .map((fftFrame: FftFrame) => {
        // TODO return classification frame
        return this.classifier.predict([fftFrame]);
      })
      .publish();
  }

  public start() {
    if (!this.classifier) {
      console.error(new Error('Classifier needs to be trained.'));
      return;
    }
    this.connection = this.classification$.connect();
  }

  public stop() {
    // TODO no connection error
    this.connection.unsubscribe();
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
