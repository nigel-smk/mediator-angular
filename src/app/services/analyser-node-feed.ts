import {Injectable, OnDestroy} from '@angular/core';
import {Observable, BehaviorSubject, Subject, Subscription} from "rxjs";
import {MediaStreamFeed} from "./media-stream-feed";

@Injectable()
export class AnalyserNodeFeed implements OnDestroy{

  private analyserNode$: Observable<AnalyserNode>;
  private connection: Subscription;

  constructor(private mediaStreamFeed: MediaStreamFeed) {
    let pipe = new Subject();
    this.analyserNode$ = pipe.switchMap((mediaStream: MediaStream)=> {
        let audioCtx = new AudioContext();
        let source = audioCtx.createMediaStreamSource(mediaStream);
        let analyserNode = audioCtx.createAnalyser();
        source.connect(analyserNode);
        return new BehaviorSubject<AnalyserNode>(analyserNode);
      })
      .multicast(new Subject())
      .refCount();
    this.connection = mediaStreamFeed.$.subscribe(pipe);
  }

  get $() {
    return this.analyserNode$;
  }

  // TODO expose API to change analyserNode options and `next` a new analysernode on changes
  public setOptions(options) {
    // set the options on the analyserNode and then `next` that analyserNode
  }

  ngOnDestroy() {
    if (this.connection) this.connection.unsubscribe();
  }

  // TODO allow initialisation and setting of analyser properties


}
