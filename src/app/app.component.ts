import { ChecklistComponent } from './application/my-modules/inspection/checklist/checklist.component';
import { IpqaComponent } from './application/my-modules/inspection/ipqa/ipqa.component';
import { Component, ViewChild, enableProdMode } from '@angular/core';
import { Platform, Nav, Keyboard, IonicApp, MenuController, App } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TranslateService } from '@ngx-translate/core';

import { LoginComponent } from './login/login.component';
import { TabsComponent } from './tabs/tabs.component';
import { PatternLockComponent } from './login/pattern-lock/pattern-lock.component';
import { MessageService } from './message/shared/service/message.service';

import { PluginService } from './core/services/plugin.service';
import { JMessageService } from './core/services/jmessage.service';
import { JPushService } from './core/services/jpush.service'
import { EnvConfig } from './shared/config/env.config';
import { LoginService } from './login/shared/service/login.service';

declare var cordova: any;
declare var window: any;


@Component({
    templateUrl: 'app.html'
})
export class MyAppComponent {
    rootPage: any;
    backButtonPressed: boolean = false;  //用于判断返回键是否触发
    @ViewChild(Nav) nav: Nav;

    constructor(private platform: Platform,
        private statusBar: StatusBar,
        private splashScreen: SplashScreen,
        private keyboard: Keyboard,
        private ionicApp: IonicApp,
        private menuCtrl: MenuController,
        private jMessage: JMessageService,
        private plugin: PluginService,
        private app: App,
        private jPushService: JPushService,
        private loginService: LoginService,
        private translate: TranslateService
    ) {

        // if (platform.is('cordova')) {
        //     enableProdMode();
        // }


        platform.ready().then(async () => {
            // test
            // this.rootPage = IpqaComponent;

            // statusBar.styleDefault();
            // splashScreen.hide();

            // cordova.plugins.backgroundMode.setDefaults({
            //     title: 'MiOA',
            //     text: 'MiOA正在后台运行',
            //     icon: 'icon',// this will look for icon.png in platforms/android/res/drawable|mipmap
            //     // color: String // hex format like 'F14F4D'
            //     resume: true,
            //     hidden: false,
            //     // bigText: 'MiOA正在后台运行 bigText'
            // });
            // cordova.plugins.backgroundMode.setEnabled(true);
            //end test

            statusBar.styleDefault();
            splashScreen.hide();
            this.jMessage.init();

            await this.appInit();
            translate.setDefaultLang('zh-TW');
            this.setDefaultLanguage();
            this.plugin.checkAppForUpdate();
            if (platform.is('cordova') && platform.is('android')) {
                let original = platform.runBackButtonAction;
                let __this = this;
                platform.runBackButtonAction = function (): void {
                    if (__this.keyboard.isOpen()) {//如果键盘开启则隐藏键盘
                        __this.keyboard.close();
                        return;
                    }
                    let activePortal = __this.ionicApp._toastPortal.getActive()
                        || __this.ionicApp._loadingPortal.getActive()
                        || __this.ionicApp._overlayPortal.getActive()
                        || __this.ionicApp._modalPortal.getActive();
                    if (activePortal) {
                        activePortal.dismiss();
                        return;
                    }
                    let activeVC = __this.nav.getActive();
                    if (activeVC.instance instanceof LoginComponent) {
                        platform.exitApp();
                    } else if (activeVC.instance instanceof PatternLockComponent) {
                        platform.exitApp();
                    } else {
                        let tabs = activeVC.instance.tabRef;
                        let activeNav = tabs.getSelected();
                        return activeNav.canGoBack() ? original.apply(platform) : cordova.plugins.backgroundMode.moveToBackground();
                    }
                }
            } else if (platform.is('cordova') && platform.is('ios')) {
                // 当应用每次从后台变成前台时，检查jmessage是否已登录，检查app是否有新版本
                this.platform.resume.subscribe(async () => {
                    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
                    if (currentUser && currentUser.username) {
                        await this.jMessage.autoLogin(currentUser.username, 'pass');
                        this.plugin.checkAppForUpdate();
                    }
                });
            }
        });
    }

    async appInit() {
        let user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
            let ADloginSuccess = await this.loginService.myADLogin(user.username, user.password);
            if (ADloginSuccess) {
                let jMsgLoginSuccess = await this.loginService.jMessageLogin(user.username, user.password);
                if (jMsgLoginSuccess && user.myNineCode) {
                    // 已经有用户信息和设定为要验证手势密码
                    this.rootPage = PatternLockComponent;
                    // this.loginJmes();
                } else if (jMsgLoginSuccess && user.autoLogin) {
                    this.rootPage = TabsComponent;
                    // this.loginJmes();
                } else {
                    this.rootPage = LoginComponent;
                }
            } else {
                this.rootPage = LoginComponent;
            }
        } else {
            this.rootPage = LoginComponent;
        }

        if (!localStorage.getItem('appVersion')) {
            localStorage.setItem('appVersion', EnvConfig.appVersion);
        }
    }

    setDefaultLanguage() {
        let preferLang = localStorage.getItem('preferLang');
        let targetLang:string;
        if(preferLang) {
          targetLang = preferLang;
        } else {
          // 若用户没有调整过语言版本，则选择与浏览器一致的版本
          let userLanguage = window.navigator.language.toLowerCase();
          let languageType = ['zh']
          let index = -1;
          languageType.forEach((val, idx) => {
              if (userLanguage.indexOf(val) > -1) {
                  index = idx;
                  return;
              }
          })
          if (index === 0) {
              if (userLanguage === 'zh-cn') {
                  targetLang = 'zh-CN'
              } else {
                  targetLang = 'zh-TW'
              }
          }
          if (index === -1) {
              targetLang = 'zh-CN'
          }
        }
        if(targetLang === this.translate.getDefaultLang()) {
          let lang = ['zh-CN', 'zh-TW'];
          this.translate.use(lang.filter((lg)=> lg !== targetLang)[0]).subscribe(() => setTimeout(() =>this.translate.use(targetLang),20))
        }
        this.translate.use(targetLang);

    }

    registerBackButtonAction() {
        this.platform.registerBackButtonAction(() => {
            if (this.keyboard.isOpen()) {//如果键盘开启则隐藏键盘
                this.keyboard.close();
                return;
            }
            if (this.menuCtrl.isOpen()) {//如果侧边菜单栏打开就关闭
                this.menuCtrl.close();
                return;
            }
            //如果想点击返回按钮隐藏toast或loading或Overlay就把下面加上
            let activePortal = this.ionicApp._toastPortal.getActive()
                || this.ionicApp._loadingPortal.getActive()
                || this.ionicApp._overlayPortal.getActive()
                || this.ionicApp._modalPortal.getActive();
            if (activePortal) {
                activePortal.dismiss();
                return;
            }
            let activeVC = this.nav.getActive();
            // console.log(activeVC);

            if (activeVC.instance instanceof LoginComponent) {
                this.platform.exitApp();
            } else if (activeVC.instance instanceof PatternLockComponent) {
                this.platform.exitApp();
            } else {
                let tabs = activeVC.instance.tabRef;
                let activeNav = tabs.getSelected();
                // console.log(activeNav);
                return activeNav.canGoBack() ? activeNav.pop() : cordova.plugins.backgroundMode.moveToBackground();
            }
        }, 1);
    }

    //双击退出功能模块并返回主界面
    showExit() {
        if (this.backButtonPressed) { //当触发标志为true时，即2秒内双击返回按键则返回主界面
            this.app.getRootNav().setRoot(TabsComponent);
        } else {
            this.backButtonPressed = true;
            this.plugin.showToast('再按一次返回主界面');
            setTimeout(() => this.backButtonPressed = false, 2000);//2秒内没有再次点击返回则将触发标志标记为false
        }
    }
}
