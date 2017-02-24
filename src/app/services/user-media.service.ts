import { Injectable } from '@angular/core';
import {ReplaySubject} from "rxjs";

@Injectable()
export class UserMediaService {

  private stream$: ReplaySubject<MediaStream> = new ReplaySubject<MediaStream>(1);

  constructor() {
  }

  public get streams() {
    return this.stream$.asObservable();
  }

  public fetchStream(constraints: MediaStreamConstraints) {
    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream: MediaStream) => this.stream$.next(stream))
      .catch((err) => console.log(err));
  }

}
