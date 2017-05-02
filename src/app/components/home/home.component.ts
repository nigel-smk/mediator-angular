import {Component, OnInit} from '@angular/core';
import {Speaker} from "../../models/speaker.model";
import {SpeakerStoreService} from "../../stores/speaker-store.service";
import {LogRegTrainerService} from "../../services/log-reg-trainer.service";
import {FftFrameStream} from "../../services/fft-frame-stream";
import {MediaStreamFeed} from "../../services/media-stream-feed";
import {AnalyserNodeFeed} from "../../services/analyser-node-feed";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [FftFrameStream, MediaStreamFeed, AnalyserNodeFeed]
})
export class HomeComponent implements OnInit{

  public speakers: Speaker[] = new Array<Speaker>();

  constructor(private mediaStreamFeed: MediaStreamFeed,
              private speakerStore: SpeakerStoreService,
              private logRegTrainer: LogRegTrainerService
  ) { }

  onRecordRelease() {
    // attempt to train the model
    this.logRegTrainer.train(this.speakers);
    this.startClassification();
  }

  startClassification() {
    if (this.speakers.filter((speaker) => speaker.voiceSample).length !== this.speakers.length) return;
    this.speakers.forEach((speaker) => {
      speaker.logRegClassStream.start();
    });
  }
  //
  // stopClassification() {
  //   this.speakers.forEach((speaker) => {
  //     speaker.logRegClassStream.stop();
  //   });
  // }

  ngOnInit() {
    // fetch speakers
    this.speakerStore.speakers.subscribe((speakers: Speaker[]) => this.speakers = speakers);
    this.speakerStore.fetchSpeakers();

    // create test users
    this.speakerStore.createSpeaker(new Speaker('Nigel', null, null));
    this.speakerStore.createSpeaker(new Speaker('Anton', null, null));

    // request user permission to access mic;
    this.mediaStreamFeed.getUserMedia({ audio: true });
  }

}
