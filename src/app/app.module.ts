import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { SpeakerCardComponent } from './components/speaker-card/speaker-card.component';
import { EqualizerComponent } from './components/equalizer/equalizer.component';
import {MediaStreamStreamService} from "./services/media-stream-stream.service";
import { AddSpeakerCardComponent } from './components/add-speaker-card/add-speaker-card.component';
import { FftSpecComponent } from './components/equalizer/fft-spec/fft-spec.component';
import { FloaterButtonComponent } from './components/equalizer/floater-button/floater-button.component';
import { HomeComponent } from './components/home/home.component';
import {SpeakerStoreService} from "./stores/speaker-store.service";
import {AnalyserNodeStreamService} from "./services/analyser-node-stream.service";
import {FftStreamService} from "./services/fft-stream.service";
import {LogRegClassStreamService} from "./services/log-reg-class-stream.service";
import {LogRegTrainerService} from "./services/log-reg-trainer.service";

@NgModule({
  declarations: [
    AppComponent,
    SpeakerCardComponent,
    EqualizerComponent,
    AddSpeakerCardComponent,
    FftSpecComponent,
    FloaterButtonComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    MediaStreamStreamService,
    SpeakerStoreService,
    AnalyserNodeStreamService,
    FftStreamService,
    LogRegClassStreamService,
    LogRegTrainerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
