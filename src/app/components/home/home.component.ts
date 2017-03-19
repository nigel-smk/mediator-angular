import {Component, OnInit} from '@angular/core';
import {Speaker} from "../../models/speaker.model";
import {MediaStreamStreamService} from "../../services/media-stream-stream.service";
import {SpeakerStoreService} from "../../stores/speaker-store.service";
import {AnalyserNodeStreamService} from "../../services/analyser-node-stream.service";
import {FftStreamService, FftFrameStream} from "../../services/fft-stream.service";
import {Observable, Subscription} from "rxjs";
import {LogRegClassStreamService} from "../../services/log-reg-class-stream.service";
import {FftSpec} from "../../models/fftSpec.model";
import {FftFrame} from "../../models/fftFrame.model";
import {LogRegTrainerService} from "../../services/log-reg-trainer.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{

  public speakers: Speaker[] = new Array<Speaker>();
  private analyser: AnalyserNode;
  private fftFrameStream: FftFrameStream;
  private analyserNode$: Observable<AnalyserNode>;
  private voiceSampleSubscription: Subscription;

  constructor(private mediaStreamStream: MediaStreamStreamService,
              private analyserNodeStream: AnalyserNodeStreamService,
              private fftFrameStreamFactory: FftStreamService,
              private speakerStore: SpeakerStoreService,
              private logRegClassStreamFactory: LogRegClassStreamService,
              private logRegTrainer: LogRegTrainerService
  ) { }

  setActive(speaker: Speaker) {
    this.speakers.forEach((speaker) => {
      speaker.analyser = null;
    });
    speaker.analyser = this.analyser;
  }

  onRecordPress(speaker: Speaker) {
    speaker.voiceSample = [];
    this.voiceSampleSubscription = this.fftFrameStream.fftFrame$.subscribe((fftFrame: FftFrame) => {
      speaker.voiceSample.push(fftFrame);
      // TODO implement ~10 second limit for frames
    });
    this.fftFrameStream.start();
  }

  onRecordRelease(speaker: Speaker) {
    this.voiceSampleSubscription.unsubscribe();
    this.fftFrameStream.stop();
    console.log(speaker.voiceSample);
  }

  trainModel() {
    this.logRegTrainer.train(this.speakers);
  }

  startClassification() {
    this.speakers.forEach((speaker) => {
      speaker.logRegClassStream.start();
    });
  }

  stopClassification() {
    this.speakers.forEach((speaker) => {
      speaker.logRegClassStream.stop();
      speaker.logRegClassStream.fftFrameStream.live();
    });
  }

  ngOnInit() {
    // fetch speakers
    this.speakerStore.speakers.subscribe((speakers: Speaker[]) => this.speakers = speakers);
    this.speakerStore.fetchSpeakers();

    // create the fftFrame stream for the training and testing
    this.fftFrameStream = this.fftFrameStreamFactory.create({
      binCount: 100,
      interval: 100,
      filter: { min: 50, max: 3000 }
    } as FftSpec);

    // create test users
    this.speakerStore.createSpeaker(new Speaker('Nigel', null, this.logRegClassStreamFactory.create(this.fftFrameStream, 33)));
    this.speakerStore.createSpeaker(new Speaker('Anton', null, this.logRegClassStreamFactory.create(this.fftFrameStream, 33)));


    this.analyserNode$ = this.analyserNodeStream.createAnalyserNodeStream();

    //old code for liveFft
    this.analyserNode$.subscribe((analyser) => {
      this.analyser = analyser;
      this.speakers[0].analyser = this.analyser; // attach analyser to first speaker
    });

    this.mediaStreamStream.fetchMediaStream({ audio: true }); // request user permission to access mic;
  }

}
