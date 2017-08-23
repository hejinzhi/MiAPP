import { IpqaComponent } from './ipqa/ipqa.component';
import { IonicPage, NavController } from 'ionic-angular';
import { Component, OnInit } from '@angular/core';


@IonicPage()
@Component({
    selector: 'sg-inspection',
    templateUrl: 'inspection.component.html'
})
export class InspectionComponent implements OnInit {
    constructor(
        private navCtrl: NavController
    ) { }

    ngOnInit() { }

    goToIPQA() {
        this.navCtrl.push(IpqaComponent);
    }
}