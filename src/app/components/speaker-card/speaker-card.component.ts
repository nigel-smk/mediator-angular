import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {Speaker} from "../../models/speaker.model";

@Component({
  selector: 'app-speaker-card',
  template: `
    <div class="card mx-auto">
      <div class="equalizer card-block">
        <app-equalizer [analyser]="speaker.analyser"></app-equalizer>
      </div>
      <div class="card-block">
        <h4 class="card-title">{{speaker.name}}</h4>
        <span class="record" (mousedown)="startCapture(speaker, $event)" (mouseup)="stopCapture(speaker, $event)" ></span>
        <span>{{ speaker.logRegClassStream.classification$ | async | json }}</span>
      </div>
    </div>`,
  styleUrls: ['./speaker-card.component.css']
})
export class SpeakerCardComponent implements OnInit {

  @Input() speaker: Speaker;
  @Output() recordPress: EventEmitter<Speaker> = new EventEmitter();
  @Output() recordRelease: EventEmitter<Speaker> = new EventEmitter();

  // TODO catch and stop propagation of click event?

  constructor() {
  }

  ngOnInit() {
  }

  startCapture(speaker: Speaker, event: Event) {
    event.stopPropagation();
    this.recordPress.emit(speaker);
  }

  stopCapture(speaker: Speaker, event: Event) {
    event.stopPropagation();
    this.recordRelease.emit(speaker);
  }

}
