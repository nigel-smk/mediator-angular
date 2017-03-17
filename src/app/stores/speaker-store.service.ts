import { Injectable } from '@angular/core';
import {ReplaySubject} from "rxjs";
import {Speaker} from "../models/speaker.model";
import {LogRegClassStreamService} from "../services/log-reg-class-stream.service";

@Injectable()
export class SpeakerStoreService {

  // TODO commit to and pull from localstorage

  private speakers$: ReplaySubject<Speaker[]> = new ReplaySubject<Speaker[]>(1);
  private _speakers: Speaker[] = [];

  constructor() {
    // mock speakers
    // this._speakers.push({name: 'Nigel'});
    // this._speakers.push({name: 'Loisel'});
  }

  get speakers() {
    return this.speakers$.asObservable();
  }

  fetchSpeakers() {
    this.speakers$.next(this._speakers);
  }

  createSpeaker(speaker: Speaker) {
    this._speakers.push(speaker);
    this.speakers$.next(this._speakers);
  }

}
