import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'app-speaker-card',
  template: `
    <div class="card mx-auto">
      <div class="equalizer card-block">
        <app-equalizer [analyser]="speaker.analyser"></app-equalizer>
      </div>
      <div class="card-block">
        <h4 class="card-title">{{speaker.name}}</h4>
      </div>
    </div>`,
  styleUrls: ['./speaker-card.component.css']
})
export class SpeakerCardComponent implements OnInit {

  @Input() speaker: {name: string}[];

  constructor() {
  }

  ngOnInit() {
  }

}
