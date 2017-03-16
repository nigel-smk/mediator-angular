import { Injectable } from '@angular/core';
import {ReplaySubject, BehaviorSubject, Observable} from "rxjs";

@Injectable()
export class UserMediaService {

  private mediaStream$: BehaviorSubject<MediaStream> = new BehaviorSubject<MediaStream>(Observable.never());
  private sourceSwitch

  constructor() {
  }

  // TODO can I get multiple MediaStreams with different constraints?

  getPrivateMediaStream() {

  }

  public get publicUserMedia() {
    return this.mediaStream$.asObservable();
  }

  public fetchStream(constraints: MediaStreamConstraints) {
    navigator.mediaDevices.getUserMedia(constraints)
      .then((mediaStream: MediaStream) => this.mediaStream$.next(mediaStream))
      .catch((err) => console.log(err));
  }

}
