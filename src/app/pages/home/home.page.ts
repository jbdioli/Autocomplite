import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { from, Subscription } from 'rxjs';
import { CityModel } from 'src/app/models/city.model';
import { CountryModel } from 'src/app/models/country.model';
import { CoreStorageService } from 'src/app/services/core-storage.service';

interface ICityModel {
  id: number;
  city: string;
  isFirstCity: boolean;
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
  countriesRef: CountryModel[];
  citiesRef: CityModel[];
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
      this.countriesRef = elmnt;
    });

    this.citySub = this.storage.getCities$.subscribe((elmmt: CityModel[]) => {
      this.citiesRef = elmmt;
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

    const buffer = this.countriesRef.filter(elmnt => elmnt.country.toLocaleLowerCase().includes(value.toLocaleLowerCase()));
    this.countriesItems = buffer;
  }

  onSelectedCountry(item: CountryModel, form: FormGroup) {
    form.patchValue({ country: item.country, idCountries: item.id });
    this.countriesItems = [];
  }

  onInputCities(ev: any) {

    const cities: string = ev.target.value;

    if (cities.length <= 0) {       // Undisplay selection box
      this.citiesItems = [];
      return;
    }

    const writingCity: ICityModel = this.findLastWriting(cities);

    this.setIsChecked(cities);

    this.citiesItems = this.citiesRef.filter(
      elmnt => elmnt.city.toLocaleLowerCase().includes(writingCity.city.toLocaleLowerCase())
    );
    // this.form.patchValue({cities: this.citiesItems[0].city});
    // console.log('object form : ', this.form.value);
  }

  onSelectedCities(item: CityModel, form: FormGroup, index: number) {
    let lastCity: ICityModel;
    let buffer: string = form.value.cities;

    lastCity = this.findLastWriting(buffer);

    const lastChat = buffer.slice(buffer.length - 1);

    let cities: string;
    if (item.city.length > 0 && lastChat !== ',') {
      if (!lastCity.isFirstCity) {
        buffer = buffer.slice(0, (buffer.length - lastCity.city.length) - 1);
        cities = buffer + ' ' + item.city;
      } else {
        cities = item.city;
      }
    }

    form.patchValue({ cities });
    this.citiesSaved.push({ id: item.id, city: item.city, isChecked: item.isChecked });
    this.citiesItems = [];
  }

  onClosingAutocomplete() {
    if (this.countriesItems.length > 0) {
      this.countriesItems = [];
      return;
    }

    if (this.citiesItems.length > 0) {
      this.citiesItems = [];
      return;
    }
  }


  findLastWriting(text: string): ICityModel {
    const city: ICityModel = { id: null, city: '', isFirstCity: false };

    const position = text.lastIndexOf(',');
    if (position > -1) {
      const c: string = text.slice(position + 1, position + 2);
      if (c.includes(' ')) {
        city.city = text.slice(position + 2);
      } else {
        city.city = text.slice(position + 1);
      }
    } else if (position === -1) {
      city.city = text;
      city.isFirstCity = true;
    }
    return city;
  }

  findCity(city: string): ICityModel {
    const returnValue: ICityModel = { id: null, city: '', isFirstCity: undefined };

    const citiesFound = this.citiesRef.filter(elmnt => elmnt.city.toLocaleLowerCase().match('^' + city.toLocaleLowerCase() + '$'));
    if (citiesFound !== undefined && citiesFound !== null && citiesFound.length === 1) {
      returnValue.city = citiesFound[0].city;
      returnValue.id = citiesFound[0].id;
    }

    return returnValue;
  }

  findIdCity(city: string): number {
    let id = 0;

    const buffer = this.citiesRef.find((elmnt) => elmnt.city.includes(city));
    id = buffer.id;

    return id;
  }

  setIsChecked(cities: string) {
    let city = '';
    const position = cities.lastIndexOf(',');

    if (position > -1) {
      const buffer: string = cities.slice(0, position);
      const positionBefore = buffer.lastIndexOf(',');
      if (positionBefore > -1) {
        const c: string = buffer.slice(positionBefore + 1, positionBefore + 2);
        if (c.includes(' ')) {
          city = buffer.slice(positionBefore + 2, position);
        } else {
          city = buffer.slice(positionBefore + 1, position);
        }
      } else {
        city = buffer;
      }
    } else {
      city = cities;
    }

    const citiesFound = this.citiesRef.find(elmnt => elmnt.city.toLocaleLowerCase().match('^' + city.toLocaleLowerCase() + '$'));
    if (citiesFound !== undefined) {
      citiesFound.isChecked = true;
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
