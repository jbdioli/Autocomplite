import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CountryModel } from 'src/app/models/country.model';
import { CoreStorageService } from 'src/app/services/core-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  sub: Subscription;
  items: CountryModel[];
  countries: CountryModel[];

  constructor(
    private storage: CoreStorageService
  ) { }


  ngOnInit() {
    this.storage.findCountry();
    this.sub = this.storage.getStrorage.subscribe((elmment) => {
      this.countries = elmment;
    });
  }

  onInput(ev: any) {
    const value = ev.target.value;
    const buffer = this.countries.filter(elmnt => elmnt.country.includes(value));
    this.items = buffer;
  }

  onSelected(item: CountryModel) {


  }


  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
