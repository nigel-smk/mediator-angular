import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {SpeakerStoreService} from "../../../stores/speaker-store.service";
import {Speaker} from "../../../models/speaker.model";
import {LogRegTrainerService} from "../../../services/log-reg-trainer.service";

@Component({
  selector: 'app-train',
  templateUrl: './train.component.html',
  styleUrls: ['./train.component.css']
})
export class TrainComponent implements OnInit {

  @Input() speaker: Speaker;
  @Output() trained: EventEmitter<null> = new EventEmitter();

  constructor() { }

  ngOnInit() {

  }

  train() {
    this.speaker.logRegClassStream.train();
    this.trained.emit(null)
  }

}
