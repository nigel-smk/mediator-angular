import { Injectable } from '@angular/core';
import {ReplaySubject} from "rxjs";

@Injectable()
export class UserMediaService {

  private mediaStream$: ReplaySubject<MediaStream> = new ReplaySubject<MediaStream>(1);

  constructor() {
  }

  // TODO can I get multiple MediaStreams with different constraints?

  public get publicUserMedia() {
    return this.mediaStream$.asObservable();
  }

  public fetchStream(constraints: MediaStreamConstraints) {
    navigator.mediaDevices.getUserMedia(constraints)
      .then((mediaStream: MediaStream) => this.mediaStream$.next(mediaStream))
      .catch((err) => console.log(err));
  }

}
