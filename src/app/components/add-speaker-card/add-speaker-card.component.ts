import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-speaker-card',
  templateUrl: './add-speaker-card.component.html',
  styleUrls: ['./add-speaker-card.component.css']
})
export class AddSpeakerCardComponent implements OnInit {

  public active: boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
