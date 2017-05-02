import {Injectable, OnDestroy} from '@angular/core';
import {Observable, BehaviorSubject, Subject, Subscription} from "rxjs";
import {MediaStreamFeed} from "./media-stream-feed";
import {AnalyserNodeSpec} from "../models/analyserNodeSpec.model";

@Injectable()
export class AnalyserNodeFeed implements OnDestroy{

  //TODO wrap the analyserNode to make it's setters private. Changing settings should push a new analyserNode down the chain

  private analyserNode$: Observable<AnalyserNode>;
  private specSwitch$: BehaviorSubject<AnalyserNode>;
  private connection: Subscription;

  private analyserNode: AnalyserNode;
  private spec: AnalyserNodeSpec = {};

  constructor(private mediaStreamFeed: MediaStreamFeed) {
    let pipe = new Subject();
    this.analyserNode$ = pipe.switchMap((mediaStream: MediaStream)=> {
        let audioCtx = new AudioContext();
        let source = audioCtx.createMediaStreamSource(mediaStream);
        this.analyserNode = audioCtx.createAnalyser();
        source.connect(this.analyserNode);
        Object.assign(this.analyserNode, this.spec);
        this.specSwitch$ = new BehaviorSubject<AnalyserNode>(this.analyserNode);
        return this.specSwitch$;
      })
      .multicast(new Subject())
      .refCount();
    this.connection = mediaStreamFeed.$.subscribe(pipe);
  }

  get $() {
    return this.analyserNode$;
  }

  ngOnDestroy() {
    if (this.connection) this.connection.unsubscribe();
  }

  public getSpec() {
    // TODO understand this property extraction magic: http://stackoverflow.com/questions/17781472/how-to-get-a-subset-of-a-javascript-objects-properties
    return (({ fftSize, frequencyBinCount, minDecibels, maxDecibels, smoothingTimeConstant }) => ({
      fftSize, frequencyBinCount, minDecibels, maxDecibels, smoothingTimeConstant
    }))(this.analyserNode);
  }

  // TODO allow initialisation and setting of analyser properties
  public setSpec(spec: AnalyserNodeSpec) {
    Object.assign(this.analyserNode, spec);
    this.specSwitch$.next(this.analyserNode);
  }

}
