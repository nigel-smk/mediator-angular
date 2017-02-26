import {Component, OnInit} from '@angular/core';
import {Speaker} from "./models/speaker.model";
import {UserMediaService} from "./services/user-media.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  public speakers: Speaker[] = new Array<Speaker>();
  private analyser: AnalyserNode;
  private audioCtx: AudioContext;

  constructor(private userMedia: UserMediaService) {
    // mock speakers
    this.speakers.push({name: 'Nigel'});
    this.speakers.push({name: 'Loisel'});
  }

  setActive(speaker: Speaker) {
    this.speakers.forEach((speaker) => {
      speaker.analyser = null;
    });
    speaker.analyser = this.analyser;
  }

  ngOnInit() {
    this.userMedia.streams.subscribe((stream: MediaStream) => {
      this.audioCtx = new AudioContext();
      let source = this.audioCtx.createMediaStreamSource(stream);
      this.analyser = this.audioCtx.createAnalyser();
      source.connect(this.analyser); // connect analyser to mic input

      this.speakers[0].analyser = this.analyser; // attach analyser to first speaker
    });

    this.userMedia.fetchStream({ audio: true }); // request user permission to access mic;
  }

}
