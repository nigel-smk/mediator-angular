import { Injectable } from '@angular/core';
import {UserMediaService} from "./user-media.service";
import {ReplaySubject} from "rxjs";

@Injectable()
export class AnalyserService {

  private _analyser: AnalyserNode;
  private analyser$: ReplaySubject<AnalyserNode> = new ReplaySubject(1);

  constructor(private userMedia: UserMediaService) {
    // TODO is it bad practice to subscribe in service?
    this.userMedia.streams.subscribe((stream: MediaStream) => {
      let audioCtx = new AudioContext();
      let source = audioCtx.createMediaStreamSource(stream);
      this._analyser = audioCtx.createAnalyser();
      source.connect(this._analyser); // connect analyser to mic input

      this.analyser$.next(this._analyser);
    });
  }

  get analyser() {
    return this.analyser$.asObservable();
  }

}
