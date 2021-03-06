
import { NavController, App } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
// import { BookLibraryComponent } from '../../application/my-modules/book-library/book-library.component';

export class MyRouter {
  constructor(private iab: InAppBrowser) { }

  public go(navCtrl: NavController, id: number, app: App): void {
    switch (id) {

      case 1:
        // app.getRootNav().setRoot(BookLibraryComponent);
        navCtrl.push('BookLibraryComponent', { moduleID: 1 });
        break;
      case 21:
        navCtrl.push('AttendanceComponent', { moduleID: 21 });
        break;
      case 22:
        // const browser = this.iab.create('http://oaweb.mic.com.tw/gsc/mobile/');
        // const browser = this.iab.create('http://10.86.0.18:8080/default.aspx?username=jinzhi.he&password=Mitac123', '_seft', 'clearcache=yes');
        const browser = this.iab.create('http://oaweb.mic.com.tw/gsc/mobile/', '_system', 'hardwareback=no');
        // const browser = this.iab.create('http://oaweb.mic.com.tw/gsc/mobile/');
        break;
      case 41:
        navCtrl.push('ChartComponent', { moduleID: 41 });
        break;
      case 61:
        navCtrl.push('InspectionComponent', { moduleID: 61 });
        break;
      default:
        break;
    }

  }

}
