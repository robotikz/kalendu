import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlacesComponent } from './places/places.component';
import { APageNotFoundComponent } from './a-page-not-found/a-page-not-found.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { ResolverPlaces } from './resolver/resolver.places';
import { GroupsComponent } from './groups/groups.component';
import { ResolverGroups } from './resolver/resolver.groups';
import { GamesComponent } from './games/games.component';
import { ResolverGames } from './resolver/resolver.games';
import { GamesGComponent } from './games-g/games-g.component';
import { ResolverGamesG } from './resolver/resolver.games.g';
import { MembersGameComponent } from './members-game/members-game.component';
import { ResolverMembersGame } from './resolver/resolver.members.game';
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
    path: 'games',
    pathMatch: 'full',
    component: GamesComponent,
    canActivate: [
    //   CanActivatePlacesGuard
    ],
    // resolve: {
    //   data: ResolverGames
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
    ResolverPlaces,
    ResolverGroups,
    ResolverGames,
    ResolverGamesG,
    ResolverMembersGame
    // CanActivatePlacesGuard
  ]
})
export class AppRoutingModule { }
