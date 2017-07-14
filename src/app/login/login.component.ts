import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, Loading } from 'ionic-angular';

import { MyHttpService } from '../core/services/myHttp.service';
import { JMessageService } from '../core/services/jmessage.service';
import { UserModel } from '../shared/models/user.model';
import { LoginConfig } from './shared/config/login.config';
import { TabsComponent } from '../tabs/tabs.component';
import { PluginService } from '../core/services/plugin.service';
import { DatabaseService } from '../message/shared/service/database.service';

@Component({
  selector: 'sg-login',
  templateUrl: 'login.component.html'
})
export class LoginComponent {

  constructor(
    public navCtrl: NavController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private myHttp: MyHttpService,
    private jmessageService: JMessageService,
    private pluginService: PluginService,
    private messageDatabaseService: DatabaseService
  ) {
  }
  appVersion: string;
  loading: Loading;
  registerCredentials = { username: 'jinzhi.he', password: 'pass' };
  currentUser: UserModel;

  ionViewDidLoad() {
    this.appVersion = localStorage.getItem('appVersion');
    if (!localStorage.getItem('currentUser')) return;
    let user = JSON.parse(localStorage.getItem('currentUser'));
    ({ username: this.registerCredentials.username, password: this.registerCredentials.password } = user);
  }
  public async login() {
    this.showLoading();
    if (this.registerCredentials.username === null || this.registerCredentials.password === null) {
      this.showError("Please insert credentials");
    } else {
      this.currentUser = new UserModel(this.registerCredentials.username, this.registerCredentials.password);
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      let res;
      try {
        res = await this.myHttp.post(LoginConfig.loginUrl, { userName: this.registerCredentials.username, password: this.registerCredentials.password }, true);
      }
      catch (err) {
        this.showError('Username or password error,please try again.');
        return;
      }

      // let jmessageLogin = await this.jmessageService.autoLogin(this.registerCredentials.username, this.registerCredentials.password);
      if (this.pluginService.isCordova()) {
        let jmessageLogin = await this.jmessageService.autoLogin(this.registerCredentials.username, 'pass');
        if (!jmessageLogin) {
          this.showError('Jmessage Login Error: ' + jmessageLogin);
          return;
        };
      }

      let token = res.json().Token;
      if (token) {
        let user = res.json().User;
        this.currentUser.id = user.ID;
        this.currentUser.avatarUrl = user.AVATAR_URL;
        this.currentUser.nickname = user.NICK_NAME;
        this.currentUser.position = user.JOB_TITLE;
        this.currentUser.department = user.DEPT_NAME;
        this.currentUser.empno = user.EMPNO;
        this.currentUser.mobile = user.MOBILE;
        this.currentUser.email = user.EMAIL;
        this.currentUser.telephone = user.TELEPHONE;
        this.currentUser.autoLogin = true;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        if (this.pluginService.isCordova()) {
          //把登陆人的头像保存到本地
          let myAvatar = await this.messageDatabaseService.getAvatarByUsername(this.currentUser.username);
          if (myAvatar.rows.length > 0) {
            await this.messageDatabaseService.updateAvatarByUsername(this.currentUser.username, this.currentUser.avatarUrl);
          }
          else {
            await this.messageDatabaseService.insertAvatarTable(this.currentUser.username, this.currentUser.nickname, this.currentUser.avatarUrl);
          }
        }

        this.loading.dismiss();
        this.navCtrl.setRoot(TabsComponent);
      } else {
        this.showError("Get Token Error");
      }
      // }
      // catch (err) {
      //   this.showError(err._body);
      // }
    }
  }

  showLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present();
  }

  showError(text: string) {
    setTimeout(() => {
      this.loading.dismiss();
    });

    let alert = this.alertCtrl.create({
      title: 'Fail',
      subTitle: text,
      buttons: ['OK']
    });
    alert.present(prompt);
  }

  test() {
    this.jmessageService.loginOut();
  }

  test2() {
    let token = localStorage.getItem('access_token');
    console.log(token);
  }

}
