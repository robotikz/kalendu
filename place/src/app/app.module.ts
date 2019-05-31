import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // this is needed!
// import { DragDropModule } from '@angular/cdk/drag-drop';
import { TagInputModule } from 'ngx-chips';

import { AngularFireModule } from '@angular/fire';
// import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFirestore, FirestoreSettingsToken } from '@angular/fire/firestore';

import { AppComponent } from './app.component';
import { AHeaderComponent } from './a-header/a-header.component';
import { AFooterComponent } from './a-footer/a-footer.component';
import { PlacesComponent } from './places/places.component';
import { PlaceListItemComponent } from './place-list-item/place-list-item.component';
import { APageNotFoundComponent } from './a-page-not-found/a-page-not-found.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { SessionService } from './services/session.service';
import { GroupsComponent } from './groups/groups.component';
import { GroupListItemComponent } from './group-list-item/group-list-item.component';
import { GameListItemComponent } from './game-list-item/game-list-item.component';
import { GamesGComponent } from './games-g/games-g.component';
import { MembersGameComponent } from './members-game/members-game.component';

import { environment } from '../environments/environment';
import { FbService } from './services/fb.service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { PusherService } from './services/pusher.service';
import { OOPipe } from './help/oo.pipe';

registerLocaleData(localeDe, 'de');

@NgModule({
  declarations: [
    AppComponent,
    AHeaderComponent,
    AFooterComponent,
    PlacesComponent,
    PlaceListItemComponent,
    APageNotFoundComponent,
    SignInComponent,
    GroupsComponent,
    GroupListItemComponent,
    GameListItemComponent,
    GamesGComponent,
    MembersGameComponent,
    OOPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxSpinnerModule,
    AngularDraggableModule,
    // DragDropModule,
    TagInputModule,
    BrowserAnimationsModule,
    NgbModule,
    AngularFireModule.initializeApp(environment.firebase),
    // AngularFireDatabaseModule,
    AngularFireStorageModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    { provide: LOCALE_ID, useValue: "de-de" },
    { provide: FirestoreSettingsToken, useValue: {} },
    FbService,
    AngularFirestore,
    AuthService,
    SessionService,
    PusherService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
  }
}
