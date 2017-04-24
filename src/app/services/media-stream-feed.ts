import { Injectable } from '@angular/core';
import {ReplaySubject, BehaviorSubject, Observable, Subject} from "rxjs";

@Injectable()
export class MediaStreamFeed {


  private sourceSwitch$ = new ReplaySubject<Observable<MediaStream>>(1); // initialise fft stream to never observable
  private mediaStream$: Observable<MediaStream> = this.sourceSwitch$
    .switchMap((obs) => obs)
    .multicast(new Subject())
    .refCount();

  // TODO can I get multiple MediaStreams with different constraints?

  get $() {
    return this.mediaStream$;
  }

  public getUserMedia(constraints: MediaStreamConstraints) {
    this.sourceSwitch$.next(Observable.fromPromise(navigator.mediaDevices.getUserMedia(constraints)));
  }

  // TODO method to switch to other MediaStream sources

}
