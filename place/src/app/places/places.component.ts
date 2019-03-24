import { Component, OnInit } from '@angular/core';
import { Place } from '../model/place';
import { PlaceDataService } from '../data-service/place-data.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-places',
  templateUrl: './places.component.html',
  styleUrls: ['./places.component.css']
})
export class PlacesComponent implements OnInit {

  loading = true;

  places: Place[] = [];

  constructor(
    private placeDataService: PlaceDataService,
    private spinner: NgxSpinnerService,
  ) {

    console.log('places - constructor');
  }

  ngOnInit() {
    this.spinner.show();
    this.placeDataService.getAllPlaces()
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

}
