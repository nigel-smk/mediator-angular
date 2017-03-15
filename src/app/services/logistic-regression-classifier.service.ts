import { Injectable } from '@angular/core';
import {SpeakerStoreService} from "../stores/speaker-store.service";
import {Speaker} from "../models/speaker.model";
import {Observable, Subscription, ConnectableObservable} from "rxjs";
import {LogisticRegressionClassification} from "../models/LogisticRegressionClassification.model";
import {FftStreamService} from "./fft-stream.service";

import 'rxjs/add/operator/sampleTime';

// js ml library in assets
declare var ml: any;

// TODO figure out how to set interval dynamically using a switchMap
const INTERVAL = 33; // ~30fps

@Injectable()
export class LogisticRegressionClassifierService {

  private speakers: Speaker[] = [];
  private classification$: ConnectableObservable<LogisticRegressionClassification>;
  private connection: Subscription;

  constructor(private speakerStore: SpeakerStoreService, private fftStreamService: FftStreamService) {
    // TODO init in app.component?
    this.init();
  }

  public init() {
    this.speakerStore.speakers.subscribe((speakers) => this.speakers = speakers);
    this.createClassifier();
  }

  public start() {
    // TODO no classifier error
    this.fftStreamService.start();
    this.classification$.connect();
  }

  public stop() {
    // TODO no connection error
    this.connection.unsubscribe();
    this.fftStreamService.stop();
  }

  public createClassifier() {
    this.classification$ = this.fftStreamService.fft
      .sampleTime(INTERVAL)
      .map((analyserFrame) => {
        let result = {};
        this.speakers.forEach((speaker) => {
          // TODO use a generated speaker id instead of name
          result[speaker.name] = speaker.classifier.predict(analyserFrame);
        });

        return result;
      })
      .publish();
  }

  public train() {
    // TODO import a matrix

    const label = {
      match: [1,0],
      noMatch: [0,1]
    };

    let labelVector: number[][] = [];
    let allSamples: Uint8Array[] = [];
    let offSet = -100;

    // collect all speaker data and create a labelVector of the same length as allSamples, all set to "noMatch"
    this.speakers.forEach((speaker) => {
      allSamples = [...allSamples, ...speaker.analyserFrames];
      labelVector = [...labelVector, ...Array(speaker.analyserFrames.length).fill(label.noMatch)]
    });

    // create labelVectors for each speaker by swapping all indexes corresponding to the speakers speech with "match"
    let i = 0;
    this.speakers.forEach((speaker) => {
      // copy the labelVector and splice in positive labels for the speaker's range of values
      speaker.dataSet = allSamples;
      speaker.labelVector = Object.assign([], labelVector);
      speaker.labelVector.splice(i, speaker.analyserFrames.length, ...Array(speaker.analyserFrames.length).fill(label.match));
      i += speaker.analyserFrames.length;
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

