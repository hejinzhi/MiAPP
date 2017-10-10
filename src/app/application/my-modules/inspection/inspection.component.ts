import { User_Update_Privilege } from './../../../shared/actions/user.action';
import { MyStore } from './../../../shared/store';
import { Store } from '@ngrx/store';
import { BossService } from './boss/shared/service/boss.service';
import { Observable } from 'rxjs/Rx';
import { InspectionCommonService } from './shared/service/inspectionCommon.service';
import { InspectionService } from './ipqa/shared/service/inspection.service';
import { IpqaComponent } from './ipqa/ipqa.component';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Component, OnInit } from '@angular/core';



@IonicPage()
@Component({
    selector: 'sg-inspection',
    templateUrl: 'inspection.component.html'
})
export class InspectionComponent implements OnInit {
    bossTips:Observable<number>;
    constructor(
        private navCtrl: NavController,
        private navParams: NavParams,
        private inspectionCommonService: InspectionCommonService,
        private bossService: BossService,
        private $store: Store<MyStore>
    ) { }

    privilegeList: {FUNCTION_ID:string,FUNCTION_NAME:string,FUNCTION_URL:string,ROLE_ID:number,ROLE_NAME:string}[];

    async ngOnInit() {
        this.bossTips = this.bossService.ObserveAllTips();
        let moduleID = this.navParams.get('moduleID');
        let res = await this.inspectionCommonService.getPrivilege(moduleID);
        this.privilegeList = res.json();
        this.$store.dispatch(new User_Update_Privilege({moduleID:moduleID,function:this.privilegeList}));
    }

    canSeeIPQA() {
        return this.hasPrivilege('IPQA');
    }

    canSeeBoss() {
        return this.hasPrivilege('BOSS');
    }

    canSeeEquip() {
        return this.hasPrivilege('EQUIP');
    }

    hasPrivilege(type: string) {
        if (this.privilegeList && this.privilegeList.length > 0) {
            for (let i = 0; i < this.privilegeList.length; i++) {
                if (this.privilegeList[i].FUNCTION_NAME === type) {
                    return true;
                }
            }
        }
        return false;
    }

    goToIPQA() {
        this.navCtrl.push('MenuComponent', { privilege: this.privilegeList });
    }
    goToEuqip() {
        this.navCtrl.push('EquipComponent');
    }

    goToBoss() {
        this.navCtrl.push('BossMenuComponent')
    }
}