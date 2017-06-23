import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Camera } from '@ionic-native/camera';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { SQLite } from '@ionic-native/sqlite';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { CodePush } from '@ionic-native/code-push';
import { Network } from '@ionic-native/network';

import { MyHttpService } from './services/myHttp.service';
import { JMessageService } from './services/jmessage.service';

import { ArrayUtilService } from './services/arrayUtil.service';
import { PluginService } from './services/plugin.service';
import { ValidateService } from './services/validate.service';




@NgModule({
    imports: [CommonModule, HttpModule],
    declarations: [],
    providers: [
        MyHttpService,
        JMessageService,
        PluginService,
        ValidateService,
        BarcodeScanner,
        Camera,
        ArrayUtilService,
        InAppBrowser,
        ScreenOrientation,
        SQLite,
        PhotoViewer,
        CodePush,
        Network
    ],
    exports: []
})
export class CoreModule {

    constructor( @Optional() @SkipSelf() parentModule: CoreModule) {
        if (parentModule) {
            throw new Error(
                'CoreModule is already loaded. Import it in the AppModule only');
        }
    }
}
