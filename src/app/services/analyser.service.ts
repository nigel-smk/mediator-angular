import { Injectable } from '@angular/core';
import {UserMediaService} from "./user-media.service";
import {ReplaySubject, Observable, BehaviorSubject} from "rxjs";

@Injectable()
export class AnalyserService {

  private analyserNode$: Observable<AnalyserNode>;

  constructor() { }

  createAnalyserNodeStream(mediaStream$: Observable<MediaStream>) {
    return mediaStream$.switchMap((mediaStream: MediaStream) => {
      let audioCtx = new AudioContext();
      let source = audioCtx.createMediaStreamSource(mediaStream);
      let analyserNode = audioCtx.createAnalyser();
      source.connect(analyserNode);
      // TODO figure out how to have the switchmap return the type of BehaviorSubject rather than Observables
      return new BehaviorSubject<AnalyserNode>(analyserNode);
    });
  }

  getPrivateAnalyserNodeStream(mediaStream$: Observable<MediaStream>) {
    return this.createAnalyserNodeStream(mediaStream$);
  }

  /**
   * Get public analyser. First call must provide a mediaStream to initialise against.
   * */
  getPublicAnalyserNodeStream(mediaStream$?: Observable<MediaStream>) {
    if (mediaStream$ || (mediaStream$ && !this.analyserNode$)) {
      this.analyserNode$ = this.createAnalyserNodeStream(mediaStream$);
    }
    else if (!mediaStream$ && !this.analyserNode$) {
      throw new Error('First call to getPublicAnalyser must pass an Observable<MediaStream>');
    }

    return this.analyserNode$;
  }

}
