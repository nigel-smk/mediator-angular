import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';

export type CssShape = 'tri-up' | 'tri-down';

@Component({
  selector: 'app-floater-button',
  template: `    
    <div class="circle" (click)="clicked($event)">
      <div class="{{ shape }}">
      </div>
    </div>
`,
  styleUrls: ['./floater-button.component.css']
})
export class FloaterButtonComponent implements OnInit {

  @Output() onClick = new EventEmitter();
  @Input() shape: CssShape;

  constructor() { }

  ngOnInit() {
  }

  clicked(event: Event) {
    event.stopPropagation();
    this.onClick.emit();
  }

}
