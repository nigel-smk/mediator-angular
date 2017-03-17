import { Injectable } from '@angular/core';
import {Observable, BehaviorSubject} from "rxjs";
import {MediaStreamStreamService} from "./media-stream-stream.service";

@Injectable()
export class AnalyserNodeStreamService {

  constructor(private mediaStreamStream: MediaStreamStreamService) { }

  // TODO allow initialisation and setting of analyser properties

  public createAnalyserNodeStream(mediaStream$: Observable<MediaStream> = this.mediaStreamStream.getMediaStream()) {
    return mediaStream$.switchMap((mediaStream: MediaStream) => {
      let audioCtx = new AudioContext();
      let source = audioCtx.createMediaStreamSource(mediaStream);
      let analyserNode = audioCtx.createAnalyser();
      source.connect(analyserNode);
      return new BehaviorSubject<AnalyserNode>(analyserNode);
    });
  }

}
