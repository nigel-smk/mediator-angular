import {Component, OnInit, Input} from '@angular/core';
import {Speaker} from "../../models/speaker.model";
import {FftFrameStream} from "../../services/fft-frame-stream";
import {Subscription} from "rxjs";
import {LogRegClassStream} from "../../services/log-reg-class-stream";

enum Phase {
  capture,
  histogram,
  train,
  predict
}
enum NavState {
  disabled,
  enabled
}

@Component({
  selector: 'app-speaker-card',
  templateUrl: './speaker-card.component.html',
  styleUrls: ['./speaker-card.component.css'],
  providers: [LogRegClassStream]
})
export class SpeakerCardComponent implements OnInit {

  public PhaseEnum = Phase;
  public NavStateEnum = NavState;

  private voiceSampleSubscription: Subscription;
  private currentPhase: Phase = Phase.capture;
  private possiblePhase: Phase = Phase.capture;
  private nextState: NavState = NavState.disabled;
  private prevState: NavState = NavState.disabled;

  @Input() speaker: Speaker;

  constructor(private fftFrameStream: FftFrameStream, private logRegClassStream: LogRegClassStream) {
  }

  ngOnInit() {
    // TODO need a better way to assign the class stream to the speaker
    this.speaker.logRegClassStream = this.logRegClassStream;
    this.logRegClassStream.setSpeaker(this.speaker);
  }

  test() {
    this.fftFrameStream.feed(this.speaker.voiceSample);
  }

  isNextNavDisabled() {
    return this.currentPhase == this.possiblePhase;
  }
  isPrevNavDisabled() {
    return this.currentPhase == 0;
  }

  navNextPossible() {
    if (this.currentPhase == this.possiblePhase && this.currentPhase < Object.keys(Phase).length / 2) {
      this.possiblePhase += 1;
    }
  }

  navNext() {
    // TODO hacky http://stackoverflow.com/questions/38034673/determine-the-number-of-enum-elements-typescript
    if (this.currentPhase < Object.keys(Phase).length / 2) {
      this.currentPhase += 1;
      this.possiblePhase = this.currentPhase;
    }
  }

  navPrev() {
    if (this.currentPhase > 0) {
      this.currentPhase -= 1;
    }
  }

}
