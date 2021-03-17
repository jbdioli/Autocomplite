import { EventEmitter, Injectable, Output } from '@angular/core';
import { CountryModel } from '../models/country.model';

@Injectable({
  providedIn: 'root'
})
export class CoreStorageService {
  @Output() getStrorage: EventEmitter<CountryModel[]> = new EventEmitter<CountryModel[]>();

  private countries: CountryModel[] = [
    {
      id: 1,
      country: 'France'
    },
    {
      id: 2,
      country: 'Etats Unis'
    },
    {
      id: 3,
      country: 'Italie'
    },
    {
      id: 4,
      country: 'Espagne'
    }
  ];

  constructor() { }

  findCountry() {
    this.getStrorage.emit([...this.countries]);
  }
}
