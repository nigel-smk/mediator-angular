import {Component, ViewChild, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {FilterSpec} from "../../models/filterSpec.model";
import {AnalyserSpec, AnalyserSpecFilter} from "../../models/analyserSpec.model";

@Component({
  selector: 'app-fft-spec',
  templateUrl: 'fft-spec.component.html',
  styleUrls: ['fft-spec.component.css']
})
export class FftSpecComponent implements OnInit {
  private filter: AnalyserSpecFilter = {};

  @Input() analyser: AnalyserNode;
  @Input() analyserSpec: AnalyserSpec;
  @Output() onFilterSet = new EventEmitter<FilterSpec>();

  constructor() { }

  ngOnInit() {
  }

  setFilter() {
    this.onFilterSet.emit(this.filter);
  }

  plusFftSize() {
    if (this.analyser.fftSize === 32768) return;
    this.analyser.fftSize *= 2;
  }

  minusFftSize() {
    if (this.analyser.fftSize === 32) return;
    this.analyser.fftSize /= 2;
  }

  // TODO write function that creates incrementer/decrementer functions

  plusMinDecibels() {
    if (this.analyser.minDecibels + 10 < this.analyser.maxDecibels) this.analyser.minDecibels += 10;
  }

  minusMinDecibels() {
    this.analyser.minDecibels -= 10;
  }

  plusMaxDecibels() {
    this.analyser.maxDecibels += 10;
  }

  minusMaxDecibels() {
    if (this.analyser.maxDecibels - 10 > this.analyser.minDecibels) this.analyser.maxDecibels -= 10;
  }

  // TODO there is some funky stuff goin on with adding 0.1
  plusSmoothingTimeConstant() {
    if (this.analyser.smoothingTimeConstant !== 1) this.analyser.smoothingTimeConstant += 0.1;
  }

  minusSmoothingTimeConstant() {
    if (this.analyser.smoothingTimeConstant !== 0) this.analyser.smoothingTimeConstant -= 0.1;
  }

}
