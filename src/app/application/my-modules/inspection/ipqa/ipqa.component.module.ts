import { SharedModule } from './../../../../shared/shared.module';
import { GridComponentModule } from './grid/grid.component.module';
import { IpqaComponent } from './ipqa.component';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
    imports: [
        IonicPageModule.forChild(IpqaComponent),
        TranslateModule.forChild(),
        GridComponentModule,
        SharedModule
    ],
    exports: [],
    declarations: [IpqaComponent],
    providers: [],
    entryComponents: [
        IpqaComponent
    ]
})
export class IpqaComponentModule { }


