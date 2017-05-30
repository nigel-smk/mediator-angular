import {Component, Input, Output, EventEmitter, OnInit, OnDestroy} from '@angular/core';
import {Speaker} from "../../../models/speaker.model";
import {FftFrame} from "../../../models/fftFrame.model";
import {Subscription} from "rxjs";
import {FftFrameStream} from "../../../services/fft-frame-stream";

@Component({
  selector: 'app-capture-sample',
  templateUrl: './capture-sample.component.html',
  styleUrls: ['./capture-sample.component.css']
})
export class CaptureSampleComponent implements OnInit, OnDestroy {

  private voiceSampleSubscription: Subscription;

  @Input() speaker: Speaker;
  @Output() recordPress: EventEmitter<Speaker> = new EventEmitter();
  @Output() recordRelease: EventEmitter<Speaker> = new EventEmitter();

  constructor(private fftFrameStream: FftFrameStream) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.voiceSampleSubscription) this.voiceSampleSubscription.unsubscribe();
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
