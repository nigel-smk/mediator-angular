import {Component, OnInit} from '@angular/core';
import {Speaker} from "../../models/speaker.model";
import {UserMediaService} from "../../services/user-media.service";
import {SpeakerStoreService} from "../../stores/speaker-store.service";
import {AnalyserService} from "../../services/analyser.service";
import {FftStreamService} from "../../services/fft-stream.service";
import {Observable, Subscription} from "rxjs";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [AnalyserService, FftStreamService]
})
export class HomeComponent implements OnInit{

  public speakers: Speaker[] = new Array<Speaker>();
  private analyser: AnalyserNode;
  private fft$: Subscription;
  //private audioCtx: AudioContext;

  constructor(private userMedia: UserMediaService,
              private analyserService: AnalyserService,
              private fftStream: FftStreamService,
              private speakerStore: SpeakerStoreService) { }

  setActive(speaker: Speaker) {
    this.speakers.forEach((speaker) => {
      speaker.analyser = null;
    });
    speaker.analyser = this.analyser;
  }

  onRecordPress(speaker: Speaker) {
    speaker.analyserFrames = [];
    this.fft$ = this.fftStream.fft.subscribe((fftResult: Uint8Array) => {
      speaker.analyserFrames.push(fftResult);
      // TODO implement ~10 second limit for frames
    });
    this.fftStream.start();
  }

  onRecordRelease(speaker: Speaker) {
    this.fft$.unsubscribe();
    this.fftStream.stop();
    console.log(speaker.analyserFrames);
  }

  ngOnInit() {
    this.speakerStore.speakers.subscribe((speakers: Speaker[]) => this.speakers = speakers);
    this.speakerStore.fetchSpeakers();

    this.analyserService.analyser.subscribe((analyser) => {
      this.analyser = analyser;
      this.speakers[0].analyser = this.analyser; // attach analyser to first speaker
    });

    this.userMedia.fetchStream({ audio: true }); // request user permission to access mic;
  }

}