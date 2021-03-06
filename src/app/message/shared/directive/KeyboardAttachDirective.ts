import { Directive, ElementRef, Input, OnDestroy } from '@angular/core';
import { Content, Platform } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';
import { Subscription } from 'rxjs/rx';

@Directive({
    selector: '[keyboardAttach]'
})
export class KeyboardAttachDirective implements OnDestroy {
    @Input() content: Content;

    private onShowSubscription: Subscription;
    private onHideSubscription: Subscription;

    private attachTime = 0;

    constructor(
        private elementRef: ElementRef,
        private platform: Platform,
        private keyboard: Keyboard
    ) {
        this.onShowSubscription = this.keyboard.onKeyboardShow().subscribe((e) => {
            localStorage.setItem('keyboardShow', 'true');
            this.onShow(e);
        });
        this.onHideSubscription = this.keyboard.onKeyboardHide().subscribe(() => {
            localStorage.setItem('keyboardShow', 'false');
            this.onHide()
        });
    }

    ngOnDestroy() {
        if (this.onShowSubscription) {
            this.onShowSubscription.unsubscribe();
        }
        if (this.onHideSubscription) {
            this.onHideSubscription.unsubscribe();
        }
    }

    private onShow(e: any) {
        if (this.platform.is('cordova') && this.platform.is('ios')) {
            let keyboardHeight: number = e.keyboardHeight || (e.detail && e.detail.keyboardHeight);
            if (this.attachTime > 1) {
                if (
                    keyboardHeight == 313 ||
                    keyboardHeight == 258 ||
                    keyboardHeight == 216 ||
                    keyboardHeight == 253 ||
                    keyboardHeight == 226 ||
                    keyboardHeight == 271 ||
                    keyboardHeight == 216 ||
                    keyboardHeight == 264) {
                    this.setElementPosition(0)
                } else {
                    if (this.attachTime > 2) {
                        this.setElementPosition(0)
                    } else {
                        this.setElementPosition(keyboardHeight);
                    }
                }
            } else {
                this.setElementPosition(keyboardHeight);
            }
            this.attachTime++;
        } else if (this.platform.is('android')) {
            this.content.scrollToBottom();
        }
    };

    private onHide() {
        if (this.platform.is('cordova') && this.platform.is('ios')) {
            this.setElementPosition(0);
            // this.content.resize();
            this.attachTime = 0
        } else if (this.platform.is('android')) {

        }
    };

    private setElementPosition(pixels: number) {
        let that = this;
        this.elementRef.nativeElement.style.paddingBottom = pixels + 'px';
        this.content.getScrollElement().style.marginBottom = (pixels + 44) + 'px';
        // setTimeout(function () {
        that.content.scrollToBottom()
        // }, 100);

    }
}