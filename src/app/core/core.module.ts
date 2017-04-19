import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';

import { MyHttpService } from './services/myHttp.service';
import { JMessageService } from './services/jmessage.service';
import { PluginService } from './services/plugin.service';
import { ValidateService } from './services/validate.service';

import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Camera } from '@ionic-native/camera';

@NgModule({
    imports: [CommonModule, HttpModule],
    declarations: [],
    providers: [MyHttpService, JMessageService, PluginService, ValidateService, BarcodeScanner, Camera],
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
