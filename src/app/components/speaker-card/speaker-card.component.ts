import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {Speaker} from "../../models/speaker.model";
import {FftFrameStream} from "../../services/fft-frame-stream";
import {Subscription} from "rxjs";
import {FftFrame} from "../../models/fftFrame.model";
import {LogRegClassStream} from "../../services/log-reg-class-stream";

@Component({
  selector: 'app-speaker-card',
  template: `
    <div class="card mx-auto">
      <div class="card-block">
        <h4 class="card-title">{{speaker.name}}</h4>
        <span class="record" (mousedown)="startCapture(speaker, $event)" (mouseup)="stopCapture(speaker, $event)" ></span>
        <span><button type="button" (click)="test()">Test</button></span>
        <span>{{ speaker.logRegClassStream?.$ | async | json }}</span>
      </div>
    </div>`,
  styleUrls: ['./speaker-card.component.css'],
  providers: [LogRegClassStream]
})
export class SpeakerCardComponent implements OnInit {

  private voiceSampleSubscription: Subscription;

  @Input() speaker: Speaker;
  @Output() recordPress: EventEmitter<Speaker> = new EventEmitter();
  @Output() recordRelease: EventEmitter<Speaker> = new EventEmitter();

  constructor(private fftFrameStream: FftFrameStream, private logRegClassStream: LogRegClassStream) {
  }

  ngOnInit() {
    this.speaker.logRegClassStream = this.logRegClassStream;
  }

  test() {
    this.fftFrameStream.feed(this.speaker.voiceSample);
  }

  startCapture(speaker: Speaker, event: Event) {
    event.stopPropagation();
    this.recordPress.emit(speaker);

    speaker.voiceSample = [];
    this.voiceSampleSubscription = this.fftFrameStream.fftFrame$.subscribe((fftFrame: FftFrame) => {
      speaker.voiceSample.push(fftFrame);
      // TODO implement ~10 second limit for frames
    });
  }

  stopCapture(speaker: Speaker, event: Event) {
    event.stopPropagation();
    this.recordRelease.emit(speaker);

    this.voiceSampleSubscription.unsubscribe();
    console.log(speaker.voiceSample);
  }

}
