import { User_Update } from './../../shared/actions/user.action';
import { MyStore } from './../../shared/store';
import { Store } from '@ngrx/store';
import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ActionSheetController, LoadingController, Loading, IonicPage } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { JMessageService } from '../../core/services/jmessage.service'
import { PluginService } from '../../core/services/plugin.service';
import { MeService } from '../shared/service/me.service';
import { TranslateService } from '@ngx-translate/core';

import { UserState } from './../../shared/models/user.model';

@IonicPage()
@Component({
  selector: 'sg-detail',
  templateUrl: 'me-detail.component.html'
})
export class MeDetailComponent implements OnInit {

  errMes: string
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private actionSheetCtrl: ActionSheetController,
    private jmessage: JMessageService,
    private plugin: PluginService,
    private loadingCtrl: LoadingController,
    private meService: MeService,
    private barcodeScanner: BarcodeScanner,
    private camera: Camera,
    private translate: TranslateService,
    private store$: Store<MyStore>
  ) { }

  user: UserState;
  base64Image: string;
  loading: Loading;
  translateTexts: any;

  ngOnInit() {
    this.translate.get(['meComponent.changeavatar', 'meComponent.selectPhoto', 'meComponent.confirm', 'takePhoto', 'meComponent.changemobile', 'meComponent.changetelephone'
      , 'meComponent.changeemail', "cancel", "correct", 'meComponent.correctsuccess', 'meComponent.correctsame', 'meComponent.incorrectemobile'
      , 'meComponent.incorrecttelephone', 'meComponent.incorrectmail']).subscribe((res) => {
        this.translateTexts = res;
      })
  }

  ionViewDidLoad() {
    this.errMes = '';
    this.user = this.navParams.data.user;
  }

  showLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present();
  }

  async getNewPhoto(type: number, size: number) {
    if (!this.plugin.isCordova()) return;
    let temp = await this.plugin.getNewPhoto(type, size).catch((e) => console.log(e));
    if (!temp) return;
    let temp1 = temp;
    temp = 'data:image/jpeg;base64,' + temp;
    this.showLoading();
    await this.meService.setAvatar(temp1).catch((err) => {
      console.log(err);
      this.plugin.errorDeal(err);
    });
    await this.meService.setLocalAvatar(this.user.username, temp);
    this.store$.dispatch(new User_Update({ avatarUrl: temp }));
    this.loading.dismiss();
    // this.user.avatarurl = await this.plugin.getNewPhoto(type, size);
    // if (!this.user.avatarurl) return;
    // this.showLoading();
    // console.log(this.user.avatarUrl);
    // await this.jmessage.updateMyAvatar(this.user.avatarUrl);
    // this.loading.dismiss();
  }
  changePhoto() {
    let actionSheet = this.actionSheetCtrl.create({
      title: this.translateTexts['meComponent.changeavatar'],
      buttons: [
        {
          text: this.translateTexts['takePhoto'],
          handler: () => {
            this.getNewPhoto(1, 400);
          }
        }, {
          text: this.translateTexts['meComponent.selectPhoto'],
          handler: () => {
            this.getNewPhoto(0, 400);
          }
        }, {
          text: this.translateTexts['cancel'],
          role: this.translateTexts['cancel'],
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  showQr(): void {
    // 从前端获取
    this.plugin.setBarcode(this.user.username);
  }

  changeDetailRequest(type: number) {
    let title = '';
    type = Number(type);
    switch (type) {
      case 1:
        title = this.translateTexts['meComponent.changemobile'];
        break;
      case 2:
        title = this.translateTexts['meComponent.changetelephone'];
        break;
      case 3:
        title = this.translateTexts['meComponent.changeemail'];
        break;
      default:
        break;
    }

    let prompt = this.plugin.getAlert().create({
      title: title,
      inputs: [
        {
          name: 'del',
          placeholder: ''
        },
      ],
      buttons: [
        {
          text: this.translateTexts['cancel'],
          handler: data => {
          }
        },
        {
          text: this.translateTexts['correct'],
          handler: data => {
            if (!this.validate(type, data.del)) return;
            this.toChangeDetail(type, data.del);
          }
        }
      ]
    });
    prompt.present();
  }
  toChangeDetail(type: number, newData: string) {
    switch (type) {
      case 1:
        this.meService.changeMobile(newData).then((res) => {
          if (Number(res.status) === 200) {
            this.user.mobile = newData;
            this.updataSucc();
          }
        }).catch((err) => {
          console.log(err);
          this.plugin.errorDeal(err);
        })
        break;
      case 2:
        this.meService.changeTele(newData).then((res) => {
          if (Number(res.status) === 200) {
            this.user.telephone = newData;
            this.updataSucc();
          }
        }).catch((err) => {
          console.log(err);
          this.plugin.errorDeal(err);
        })
        break;
      case 3:
        this.meService.changeMobile(newData).then((res) => {
          if (Number(res.status) === 200) {
            this.user.email = newData;
            this.updataSucc();
          }
        }).catch((err) => {
          console.log(err);
          this.plugin.errorDeal(err);
        })
        break;
      default:
        break;
    }
  }
  updataSucc() {
    this.updateUser();
    this.plugin.showToast(this.translateTexts['meComponent.correctsuccess'])
  }
  updateUser() {
    this.store$.dispatch(new User_Update(this.user));
  }
  isSame() {
    this.plugin.showToast(this.translateTexts['meComponent.correctsame']);
  }
  validate(type: number, newData: string) {
    let res = false;
    switch (type) {
      case 1:
        if (newData === this.user.mobile) {
          this.isSame();
          return;
        }
        res = /^1\d{10}$/.test(newData);
        this.errMes = res ? '' : newData + ': ' + this.translateTexts['meComponent.incorrectemobile'];
        break;
      case 2:
        if (newData === this.user.telephone) {
          this.isSame();
          return;
        }
        res = /^\d{4}\-\d{8}$/.test(newData) || /^\d{4}$/.test(newData);
        this.errMes = res ? '' : newData + ': ' + this.translateTexts['meComponent.incorrecttelephone'];
        break;
      case 3:
        if (newData === this.user.email) {
          this.isSame();
          return;
        }
        res = /^([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-]*)*\@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])*/.test(newData);
        this.errMes = res ? '' : newData + ': ' + this.translateTexts['meComponent.incorrectemail'];
        break;
      default:
        break;
    }
    return res;
  }
}
