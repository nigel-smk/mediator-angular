import {Component, OnInit, OnDestroy} from '@angular/core';
import {AnalyserNodeFeed} from "../../services/analyser-node-feed";
import {Subscription} from "rxjs";
import {FftFrameStream} from "../../services/fft-frame-stream";
import {FftSpec} from "../../models/fftSpec.model";
import {FftFilterSpec} from "../../models/fftFilterSpec.model";

@Component({
  selector: 'app-fft-spec',
  templateUrl: 'fft-spec.component.html',
  styleUrls: ['fft-spec.component.css']
})
export class FftSpecComponent implements OnInit, OnDestroy {

  private filter: FftFilterSpec;
  private analyser: AnalyserNode;
  private subscription: Subscription;

  constructor(private analyserNodeFeed: AnalyserNodeFeed, private fftFrameStream: FftFrameStream) { }

  ngOnInit() {
    this.subscription = this.analyserNodeFeed.$.subscribe((analyserNode) => this.analyser = analyserNode);
    this.filter = this.fftFrameStream.getSpec().filter;
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  setFilter() {
    this.fftFrameStream.setSpec({ filter: this.filter } as FftSpec);
  }

  plusFftSize() {
    if (this.analyser.fftSize === 32768) return;
    this.analyserNodeFeed.setSpec({ fftSize: this.analyser.fftSize * 2 });
  }

  minusFftSize() {
    if (this.analyser.fftSize === 32) return;
    this.analyserNodeFeed.setSpec({ fftSize: this.analyser.fftSize / 2 });
  }

  // TODO write function that creates incrementer/decrementer functions

  plusMinDecibels() {
    if (this.analyser.minDecibels + 10 >= this.analyser.maxDecibels) return;
    this.analyserNodeFeed.setSpec({ minDecibels: this.analyser.minDecibels + 10 });
  }

  minusMinDecibels() {
    this.analyserNodeFeed.setSpec({ minDecibels: this.analyser.minDecibels - 10 });
  }

  plusMaxDecibels() {
    this.analyserNodeFeed.setSpec({ maxDecibels: this.analyser.maxDecibels + 10 });
  }

  minusMaxDecibels() {
    if (this.analyser.maxDecibels - 10 <= this.analyser.minDecibels) return;
    this.analyserNodeFeed.setSpec({ maxDecibels: this.analyser.maxDecibels - 10 });
  }

  // TODO there is some funky stuff goin on with adding 0.1
  plusSmoothingTimeConstant() {
    if (this.analyser.smoothingTimeConstant === 1) return;
    this.analyserNodeFeed.setSpec({ smoothingTimeConstant: this.analyser.smoothingTimeConstant + 0.1 });
  }

  minusSmoothingTimeConstant() {
    if (this.analyser.smoothingTimeConstant === 0) return;
    this.analyserNodeFeed.setSpec({ smoothingTimeConstant: this.analyser.smoothingTimeConstant - 0.1 });
  }

}
