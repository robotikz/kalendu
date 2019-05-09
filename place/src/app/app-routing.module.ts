import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlacesComponent } from './places/places.component';
import { APageNotFoundComponent } from './a-page-not-found/a-page-not-found.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { GroupsComponent } from './groups/groups.component';
import { GamesGComponent } from './games-g/games-g.component';
import { MembersGameComponent } from './members-game/members-game.component';
// import { CanActivatePlacesGuard } from './can-activate-places.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'places',
    pathMatch: 'full',
    canActivate: [
    //   CanActivatePlacesGuard
    ]
  },
  {
    path: 'sign-in',
    component: SignInComponent
  },
  {
    path: 'places',
    component: PlacesComponent,
    canActivate: [
    //   CanActivatePlacesGuard
    ]
  },
  {
    path: 'groups',
    component: GroupsComponent,
    canActivate: [
    //   CanActivatePlacesGuard
    ],
    // resolve: {
    //   data: ResolverGroups
    // }
  },
  {
    path: 'gamesg',
    pathMatch: 'full',
    component: GamesGComponent,
    canActivate: [
    //   CanActivatePlacesGuard
    ],
    // resolve: {
    //   data: ResolverGamesG
    // }
  },
  {
    path: 'gamem',
    pathMatch: 'full',
    component: MembersGameComponent,
    canActivate: [
    //   CanActivatePlacesGuard
    ],
    // resolve: {
      // data: ResolverMembersGame
    // }
  },
  // {
  //   path: 'games/:id',
  //   pathMatch: 'full',
  //   component: MembersGameComponent,
  //   canActivate: [
  //   //   CanActivatePlacesGuard
  //   ],
  //   // resolve: {
  //     // data: ResolverMembersGame
  //   // }
  // },
  {
    path: '**',
    component: APageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    // ResolverPlaces,
    // CanActivatePlacesGuard
  ]
})
export class AppRoutingModule { }
