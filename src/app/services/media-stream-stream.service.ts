import { Injectable } from '@angular/core';
import {ReplaySubject, BehaviorSubject, Observable} from "rxjs";

@Injectable()
export class MediaStreamStreamService {


  private sourceSwitch$ = new BehaviorSubject<Observable<MediaStream>>(Observable.never()); // initialise fft stream to never observable
  private mediaStream$: Observable<MediaStream> = this.sourceSwitch$.switchMap((obs) => obs);

  constructor() {
  }

  // TODO can I get multiple MediaStreams with different constraints?

  getMediaStream() {
    return this.mediaStream$
  }

  public fetchMediaStream(constraints: MediaStreamConstraints) {
    navigator.mediaDevices.getUserMedia(constraints)
      .then((mediaStream: MediaStream) => this.sourceSwitch$.next(new BehaviorSubject(mediaStream)))
      .catch((err) => console.log(err));
  }

}
