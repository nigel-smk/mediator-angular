import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import {Speaker} from "../../../models/speaker.model";

@Component({
  selector: 'app-predict',
  templateUrl: './predict.component.html',
  styleUrls: ['./predict.component.css']
})
export class PredictComponent implements OnInit, OnDestroy {

  @Input() speaker: Speaker;

  constructor() { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.speaker.logRegClassStream.stop();
  }

  startClassification() {
    this.speaker.logRegClassStream.start();
  }
}
