import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CityModel } from 'src/app/models/city.model';
import { CountryModel } from 'src/app/models/country.model';
import { CoreStorageService } from 'src/app/services/core-storage.service';

interface ICity {
  city: string;
  isNew: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  countrySub: Subscription;
  citySub: Subscription;

  form: FormGroup;

  countriesItems: CountryModel[] = [];
  citiesItems: CityModel[] = [];
  countries: CountryModel[];
  cities: CityModel[];
  citiesSaved: CityModel[] = [];

  isCityChecked: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private storage: CoreStorageService
  ) { }


  ngOnInit() {
    this.initForm();
    this.storage.findCountries();
    this.storage.findCities();
    this.countrySub = this.storage.getCountries$.subscribe((elmnt: CountryModel[]) => {
      this.countries = elmnt;
    });

    this.citySub = this.storage.getCities$.subscribe((elmmt: CityModel[]) => {
      this.cities = elmmt;
    });
  }

  initForm() {
    this.form = this.formBuilder.group({
      country: ['', Validators.required],
      idCountries: null,
      cities: ['', Validators.required]
    });

  }

  onInputCountry(ev: any) {
    const value: string = ev.target.value;

    if (value.length <= 0) {
      this.countriesItems = [];
      return;
    }

    const buffer = this.countries.filter(elmnt => elmnt.country.toLocaleLowerCase().includes(value.toLocaleLowerCase()));
    this.countriesItems = buffer;
  }

  onSelectedCountry(item: CountryModel, form: FormGroup) {
    form.patchValue({country: item.country, idCountries: item.id});
    this.countriesItems = [];
  }

  onInputCities(ev: any) {
    let city: ICity;
    const cities: string = ev.target.value;

    if (cities.length <= 0) {       // Undisplay selection box
      this.citiesItems = [];
      return;
    }

    city = this.findLastCity(cities);

    if (!city.isNew) {
      this.setIsChecked(city.city);
      return;
    }
    this.setIsChecked(cities);
  }

  onSelectedCities(item: CityModel, form: FormGroup, index: number) {
    const buffer: string = form.value.cities;

    const position = buffer.lastIndexOf(',');

    let cities: string;
    if (item.city.length > 0) {
      cities = buffer + ', ' + item.city;
    }

    form.patchValue({cities});
    this.citiesSaved.push({city: item.city, id: item.id, isChecked: item.isChecked});
    this.citiesItems = [];
  }

  onClosingAutocomplete() {
    if ( this.countriesItems.length > 0) {
      this.countriesItems = [];
      return;
    }

    if ( this.citiesItems.length > 0) {
      this.citiesItems = [];
      return;
    }
  }


  findLastCity(cities: string): ICity {
    const city: ICity = {city: '', isNew: false};

    const position = cities.lastIndexOf(',');
    if (position > -1) {
      const c: string = cities.slice(position + 1, position + 2);
      if (c.includes(' ')) {
        city.city = cities.slice(position + 2);
      } else {
        city.city = cities.slice(position + 1);
      }
    } else if (position === -1) {
      city.city = cities;
      city.isNew = true;
    }
    return city;
  }

  setIsChecked(city: string) {
    this.citiesItems = this.cities.filter(elmnt => elmnt.city.toLocaleLowerCase().includes(city.toLocaleLowerCase()));
    if (this.citiesItems.length === 1 && this.citiesItems[0].city.includes(city)) {
      this.citiesItems[0].isChecked = true;
    }
  }

  onSave() {
    console.log('Form : ', this.form.value);
    console.log('citiesSaved object', this.citiesSaved);
  }


  ngOnDestroy(): void {
    this.countrySub.unsubscribe();
    this.citySub.unsubscribe();
  }

}
