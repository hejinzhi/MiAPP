import { SearchColleagueComponentModule } from './../../../../../shared/components/search-colleague/search-colleague.component.module';
import { PhotoViewComponentModule } from './../../../../../shared/components/photo-view/photo-view.component.module';
import { BossReportComponent } from './boss-report.component';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        IonicPageModule.forChild(BossReportComponent),
        TranslateModule.forChild(),
        PhotoViewComponentModule,
        SearchColleagueComponentModule
    ],
    exports: [],
    declarations: [BossReportComponent],
    providers: [],
    entryComponents: [
        BossReportComponent
    ]
})
export class BossReportComponentModule { }