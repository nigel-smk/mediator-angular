import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { SpeakerCardComponent } from './components/speaker-card/speaker-card.component';
import { EqualizerComponent } from './components/equalizer/equalizer.component';
import {UserMediaService} from "./services/user-media.service";
import { AddSpeakerCardComponent } from './components/add-speaker-card/add-speaker-card.component';
import { FftSpecComponent } from './components/equalizer/fft-spec/fft-spec.component';
import { FloaterButtonComponent } from './components/equalizer/floater-button/floater-button.component';

@NgModule({
  declarations: [
    AppComponent,
    SpeakerCardComponent,
    EqualizerComponent,
    AddSpeakerCardComponent,
    FftSpecComponent,
    FloaterButtonComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [UserMediaService],
  bootstrap: [AppComponent]
})
export class AppModule { }
