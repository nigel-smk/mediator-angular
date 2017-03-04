import {Component, OnInit, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-floater-button',
  template: `    
    <div class="circle" (click)="clicked($event)">
      <div class="down-tri">
      </div>
    </div>
`,
  styleUrls: ['./floater-button.component.css']
})
export class FloaterButtonComponent implements OnInit {

  @Output() onClick = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  clicked(event: Event) {
    event.stopPropagation();
    this.onClick.emit();
  }

}
