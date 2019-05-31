import { Component, OnInit } from '@angular/core';
import { Place } from '../model/place';
import { NgxSpinnerService } from 'ngx-spinner';
import { FbService } from '../services/fb.service';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-places',
  templateUrl: './places.component.html',
  styleUrls: ['./places.component.css'],
  animations: [
    trigger('fadeGM', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('2s', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('.5s', style({ opacity: 0 }))
      ]),
    ]),
  ],
})
export class PlacesComponent implements OnInit {

  loading = true;

  places: Place[] = [];

  constructor(
    private fbService: FbService,
    private spinner: NgxSpinnerService,
    public router: Router,
  ) {

    console.log('places - constructor');
  }

  ngOnInit() {
    setTimeout(() => {
      this.spinner.show();
    }, 100);
    this.fbService.getAllPlaces()
      // this.route.data
      .subscribe(
        (d) => {
          console.log('ngOnInit - getAllPlaces - ', d);
          this.places = d;
          this.spinner.hide();
          this.loading = false;
        }
      );
  }

  onNavigateGroup(place: Place) {
    // alert('Member-Link for test only, in der Zukunft für privat wird unmöglich');
    this.router.navigate(['/groups',{place_id: place.id}]);
  }
}
