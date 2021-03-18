import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { from, Subscription } from 'rxjs';
import { CityModel } from 'src/app/models/city.model';
import { CountryModel } from 'src/app/models/country.model';
import { CoreStorageService } from 'src/app/services/core-storage.service';

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

  position = 0;

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
    const value: string = ev.target.value;
    const oldPosition = this.position;
    // console.log('value', value);


    this.position = value.lastIndexOf(',');
    if (this.position > -1) {
      let newValue: string;
      const c: string = value.slice(this.position + 1, this.position + 2);
      if (c.includes(' ')) {
        newValue = value.slice(this.position + 2);
      } else {
        newValue = value.slice(this.position + 1);
      }

      // console.log('newValue', newValue);
      // console.log('Position', this.position);

      this.citiesItems = this.cities.filter(elmnt => elmnt.city.toLocaleLowerCase().includes(newValue.toLocaleLowerCase()));
      console.log('Cities Items', this.citiesItems);
    }

    if (value.length <= 0) {
      this.citiesItems = [];
      return;
    }

    const buffer = this.cities.filter(elmnt => elmnt.city.toLocaleLowerCase().includes(value.toLocaleLowerCase()));
    this.citiesItems = buffer;
  }

  onSelectedCities(item: CityModel, form: FormGroup, index: number) {
    const buffer = form.value.cities + ', ' + item.city;

    form.patchValue({cities: item.city});
    this.citiesSaved.push({city: item.city, id: item.id, isChecked: item.isChecked});
    this.citiesItems = [];
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
