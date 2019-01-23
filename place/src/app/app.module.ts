import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faFutbol, faHockeyPuck, faEuroSign, faMapMarkerAlt, faLocationArrow, faLock, faEnvelope,
  faUnlockAlt, faCalendarCheck, faClock, faRunning, faRestroom, faPlus, faCopy, faTrashAlt, faShareAlt,
  faSlidersH, faEdit, faCheck, faCheckCircle, faTimesCircle, faArrowRight, faTshirt, faCalendarAlt, faBan, faPlay, faBell, faFlagCheckered
} from '@fortawesome/free-solid-svg-icons';
// import { faTimesCircle as farTimesCircle, faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';

import { AppComponent } from './app.component';
import { AHeaderComponent } from './a-header/a-header.component';
import { AFooterComponent } from './a-footer/a-footer.component';
import { PlacesComponent } from './places/places.component';
import { PlaceListItemComponent } from './place-list-item/place-list-item.component';
import { APageNotFoundComponent } from './a-page-not-found/a-page-not-found.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { PlaceDataService } from './data-service/place-data.service';
import { AuthService } from './services/auth.service';
import { SessionService } from './services/session.service';
import { GroupsComponent } from './groups/groups.component';
import { GroupListItemComponent } from './group-list-item/group-list-item.component';
import { GamesComponent } from './games/games.component';
import { GameListItemComponent } from './game-list-item/game-list-item.component';
import { GamesGComponent } from './games-g/games-g.component';
import { MembersGameComponent } from './members-game/members-game.component';

import { environment } from '../environments/environment';
import { FbService } from './services/fb.service';
import { ApiService } from './services/api.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { ServiceWorkerModule } from '@angular/service-worker';
import { PusherService } from './services/pusher.service';

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
    GamesComponent,
    GameListItemComponent,
    GamesGComponent,
    MembersGameComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    FontAwesomeModule,
    NgbModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    PlaceDataService,
    ApiService,
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
    // Add an icon to the library for convenient access in other components
    library.add(faFutbol, faHockeyPuck, faEuroSign, faMapMarkerAlt, faLocationArrow,
      faLock, faEnvelope, faUnlockAlt,
      faCalendarCheck, faClock, faRunning, faRestroom,
      faPlus, faCopy, faTrashAlt, faShareAlt, faSlidersH, faEdit,
      faCheck, faCheckCircle, faTimesCircle,
      faArrowRight, faTshirt, faCalendarAlt, faBan, faPlay,
      faBell, faFlagCheckered);
  }
}
