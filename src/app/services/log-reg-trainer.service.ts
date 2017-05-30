import { Injectable } from '@angular/core';
import {Speaker} from "../models/speaker.model";
import {SpeakerStoreService} from "../stores/speaker-store.service";

// js ml library in assets
declare var ml: any;

@Injectable()
export class LogRegTrainerService {
  // TODO class currently extracts data for all speakers every time extract Data is called
  // TODO speaker data observable that can run data extraction when data changes
  /**
   * updateData(speaker, data) {
   *    bind data to speaker
   *    if all speakers have data, extract features for all speakers
    * }
   * */

  private speakers: Speaker[];

  constructor(speakerStore: SpeakerStoreService) {
    speakerStore.speakers.subscribe((speakers: Speaker[]) => {
      this.speakers = speakers;
    })
  }

  public train() {
    // TODO import a matrix
    if (!this.speakers) return;
    let speakers = this.speakers;

    let sampledSpeakers = speakers.filter((speaker) => {
      return speaker.voiceSample;
    });
    if (sampledSpeakers.length !== speakers.length) return;

    const label = {
      match: [1,0],
      noMatch: [0,1]
    };

    let labelVector: number[][] = [];
    let allSamples: Uint8Array[] = [];

    // collect all speaker data and create a labelVector of the same length as allSamples, all set to "noMatch"
    speakers.forEach((speaker) => {
      allSamples = [...allSamples, ...speaker.voiceSample];
      labelVector = [...labelVector, ...Array(speaker.voiceSample.length).fill(label.noMatch)]
    });

    // create labelVectors for each speaker by swapping all indexes corresponding to the speakers speech with "match"
    let i = 0;
    speakers.forEach((speaker) => {
      // copy the labelVector and splice in positive labels for the speaker's range of values
      speaker.labelVector = Object.assign([], labelVector);
      speaker.labelVector.splice(i, speaker.voiceSample.length, ...Array(speaker.voiceSample.length).fill(label.match));
      i += speaker.voiceSample.length;
    });

    // speakers.forEach((speaker) => {
    //   speaker.logRegClassStream.train(allSamples, speaker.labelVector);
    // });

  }

}
