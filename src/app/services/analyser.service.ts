import { Injectable } from '@angular/core';
import {UserMediaService} from "./user-media.service";
import {Observable, ReplaySubject} from "rxjs";

@Injectable()
export class AnalyserService {

  private analyser$: ReplaySubject<AnalyserNode>;
  private _analyser: AnalyserNode;
  private audioCtx: AudioContext;

  constructor(private userMedia: UserMediaService) { }

  get analysers() {
    return this.analyser$.asObservable();
  }

  setFftSize(size: number) {
    this._analyser.fftSize = size;
  }

  init() {
    this.userMedia.streams.subscribe((stream: MediaStream) => {
      this.audioCtx = new AudioContext();
      this._analyser = this.audioCtx.createAnalyser();
      this.analyser$.next(this._analyser);
    });
  }

}
