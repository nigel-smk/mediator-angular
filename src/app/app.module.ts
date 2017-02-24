import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { SpeakerCardComponent } from './components/speaker-card/speaker-card.component';
import { EqualizerComponent } from './components/equalizer/equalizer.component';
import {UserMediaService} from "./services/user-media.service";

@NgModule({
  declarations: [
    AppComponent,
    SpeakerCardComponent,
    EqualizerComponent
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
