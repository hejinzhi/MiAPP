import { Component, ViewChild } from '@angular/core';
import { Tabs } from 'ionic-angular'
import { NavController, NavParams, App, Platform, IonicPage } from 'ionic-angular';
import { LanguageConfig } from './shared/config/language.config';

@IonicPage()
@Component({
  selector: 'sg-chart',
  templateUrl: 'chart.component.html'
})
export class ChartComponent {

  tab1Root = 'StorageComponent';
  tab2Root = 'SaleComponent';
  tab3Root = 'ManufactureComponent';
  tab4Root = 'HumanResourcesComponent';


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
  ) { }

  ionViewDidLoad() {

  }
  ionViewWillLeave() {

  }
}
