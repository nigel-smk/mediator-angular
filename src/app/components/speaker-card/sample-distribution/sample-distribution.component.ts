import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {D3Service, D3} from "d3-ng2-service";
import {Speaker} from "../../../models/speaker.model";
import {FftFrame} from "../../../models/fftFrame.model";

@Component({
  selector: 'app-sample-distribution',
  templateUrl: 'sample-distribution.component.html',
  styleUrls: ['sample-distribution.component.css']
})
export class SampleDistributionComponent implements OnInit {

  @Input() speaker: Speaker;
  @Output() ready: EventEmitter<any> = new EventEmitter();

  private flattenedFftFrames: number[];

  constructor() { }

  ngOnInit() {
    // flatten all fft values into single array
    // TODO let D3 handle this?
    this.flattenedFftFrames = this.speaker.voiceSample.reduce((aggregate: number[], fftFrame: FftFrame) => {
      return aggregate.concat(Array.from(fftFrame))
    }, []);

    // set threshold to mean if not set
    if (this.speaker.threshold == null) {
      let sum = this.flattenedFftFrames.reduce((sum: number, value: number) => {
        return sum + value;
      });
      this.speaker.threshold = sum / this.flattenedFftFrames.length;
    }

    // emit ready signal
    this.ready.emit(null);
  }



}
