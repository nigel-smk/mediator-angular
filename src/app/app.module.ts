import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { SpeakerCardComponent } from './components/speaker-card/speaker-card.component';
import { EqualizerComponent } from './components/equalizer/equalizer.component';
import { FftSpecComponent } from './components/fft-spec/fft-spec.component';
import { FloaterButtonComponent } from './components/equalizer/floater-button/floater-button.component';
import { HomeComponent } from './components/home/home.component';
import {SpeakerStoreService} from "./stores/speaker-store.service";
import {LogRegTrainerService} from "./services/log-reg-trainer.service";
import { SpectrogramComponent } from './components/spectrogram/spectrogram.component';
import { SampleDistributionComponent } from './components/speaker-card/sample-distribution/sample-distribution.component';
import {D3Service} from "d3-ng2-service";
import { HistogramComponent } from './components/speaker-card/sample-distribution/histogram/histogram.component';
import { CaptureSampleComponent } from './components/speaker-card/capture-sample/capture-sample.component';
import { TrainComponent } from './components/speaker-card/train/train.component';
import { PredictComponent } from './components/speaker-card/predict/predict.component';

@NgModule({
  declarations: [
    AppComponent,
    SpeakerCardComponent,
    EqualizerComponent,
    FftSpecComponent,
    FloaterButtonComponent,
    HomeComponent,
    SpectrogramComponent,
    SampleDistributionComponent,
    HistogramComponent,
    CaptureSampleComponent,
    TrainComponent,
    PredictComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    SpeakerStoreService,
    LogRegTrainerService,
    D3Service
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
