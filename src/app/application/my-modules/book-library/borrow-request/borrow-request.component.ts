import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NavParams, AlertController, IonicPage } from 'ionic-angular';
import { CheckList } from '../../../../shared/models/check-list.model';
import { ArrayUtilService } from '../../../../core/services/arrayUtil.service';
import { BookLibraryService } from '../shared/service/book-library.service';
import { LanguageConfig } from '../shared/config/language.config';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
    selector: 'sg-borrow-request',
    templateUrl: 'borrow-request.component.html'
})

// 借书申请，还书，取消预约共用这一个页面
export class BorrowRequestComponent implements OnInit {
    selectIDs: number[] = []; // 返回的借书人的清单
    books: any[] = []; // 记录后端返回的原始数据
    userListAfterTransform: CheckList[] = []; // 对借书清单进行分组处理，保存处理后的借书清单
    title: string;// 页面title
    type: string; // 记录时哪个页面转跳过来的，borrow代表借书申请 payback 代表还书  cancelbook 代表取消预约
    showBorrow: boolean = false; // 是否借书申请转跳过来的
    showPayback: boolean = false; // 是否还书转跳过来的
    showCancelBook: boolean = false; // 是否取消预约转跳过来的
    showXuejie: boolean = false; // 是否續借
    enableBtn: boolean = false; // 控制右上角的按钮是否可以被点击
    showPayBackDate: boolean = false;

    translateText: any;  // 翻译文本
    constructor(
        public navParams: NavParams,
        private arrayService: ArrayUtilService,
        private bookService: BookLibraryService,
        private alertCtrl: AlertController,
        private ref: ChangeDetectorRef,
        private translate: TranslateService
    ) { }

    ngOnInit() {
        this.books = this.navParams.get('books');
        this.type = this.navParams.get('type');
        if (this.type === 'borrow') {
            this.translate.get('bookLibrary.borrowRequest').subscribe((title) => {
                this.title = title;
            });
            this.showBorrow = true;
            this.showPayback = false;
            this.showCancelBook = false;
        } else if (this.type === 'payback') {
            this.translate.get('bookLibrary.paybackRequest').subscribe((title) => {
                this.title = title;
            });
            this.showBorrow = false;
            this.showPayback = true;
            this.showCancelBook = false;
        } else if (this.type === 'cancelbook') {
            this.translate.get('bookLibrary.booked').subscribe((title) => {
                this.title = title;
            });
            this.showBorrow = false;
            this.showPayback = false;
            this.showCancelBook = true;
        }
        else if (this.type === 'xujie') {
            this.translate.get('bookLibrary.borrowed_books').subscribe((title) => {
                this.title = title;
            });
            this.showBorrow = false;
            this.showPayback = false;
            this.showCancelBook = false;
            this.showXuejie = true;
            this.showPayBackDate = true;

        }
        if (this.books) {
            this.userListAfterTransform = this.transformUserList(this.books);
        }

        this.translate.get(['bookLibrary.borrowSuc', 'bookLibrary.borrowFail', 'bookLibrary.cancelBookSuc', 'bookLibrary.cancelBookFail',
            'bookLibrary.paybackSuc', 'bookLibrary.paybackFail', 'bookLibrary.renewSuc', 'bookLibrary.renewFail']).subscribe((res) => {
                this.translateText = res;
            });
    }

    transformUserList(books: any[]) {
        let temp: string[] = [];
        books.forEach((value) => {
            temp.push(value.USER_NAME);
        });
        let userList: string[];
        userList = this.arrayService.unique(temp);
        let result: CheckList[] = [];
        for (let i = 0; i < userList.length; i++) {
            let bookList = books.filter((book) => {
                return book.USER_NAME === userList[i];
            });
            result.push({
                USER_NAME: userList[i],
                BOOKS: bookList
            });
        }
        return result;
    }

    // 确认借阅
    async borrowConfirm() {
        try {
            await this.bookService.approveBorrowBooks(this.selectIDs);
            this.showInfo(this.translateText['bookLibrary.borrowSuc']);
            this.removeItemFromLocalList(this.selectIDs);
            this.userListAfterTransform = this.transformUserList(this.books);
            this.selectIDs = [];
        }
        catch (err) {
            this.showError(this.translateText['bookLibrary.borrowFail'] + err);
        }
        // console.log(this.translateText['bookLibrary.borrowFail']);
    }

    // 取消预约
    async cancelBook() {
        try {
            await this.bookService.cancelBook(this.selectIDs);
            this.showInfo(this.translateText['bookLibrary.cancelBookSuc']);
            this.removeItemFromLocalList(this.selectIDs);
            this.userListAfterTransform = this.transformUserList(this.books);
            this.selectIDs = [];
        }
        catch (err) {
            this.showError(this.translateText['bookLibrary.cancelBookFail'] + err);
        }
    }

    // 确认还书
    async paybackConfirm() {
        try {
            await this.bookService.payback(this.selectIDs);
            this.showInfo(this.translateText['bookLibrary.paybackSuc']);
            this.removeItemFromLocalList(this.selectIDs);
            this.userListAfterTransform = this.transformUserList(this.books);
            this.selectIDs = [];
        }
        catch (err) {
            this.showError(this.translateText['bookLibrary.paybackFail'] + err);
        }
    }

    //续借
    async xujie() {
        try {
            await this.bookService.renewBooks(this.selectIDs);
            this.showInfo(this.translateText['bookLibrary.renewSuc']);
            // this.removeItemFromLocalList(this.selectIDs);
            // this.userListAfterTransform = this.transformUserList(this.books);
            this.selectIDs = [];
        } catch (err) {
            this.showError(this.translateText['bookLibrary.renewFail'] + err);
        }
    }

    // 当把后台的数据更新后，同步把本地的数据也删除，刷新页面
    removeItemFromLocalList(ids: number[]) {
        for (let i = 0; i < ids.length; i++) {
            for (let j = 0; j < this.books.length; j++) {
                if (this.books[j].ID === ids[i]) {
                    this.books.splice(j, 1);
                }
            }
        }
    }

    onSelectItem(id: number) {
        this.addItem(this.selectIDs, id);
        // 这个事件是子组件被选中时emit出来的，需要手动通知angular检查数据变化，否则会报错
        this.ref.detectChanges();
    }

    onUnselectItem(id: number) {
        this.removeItem(this.selectIDs, id);
        this.ref.detectChanges();
    }

    addItem(array: number[], item: number) {
        if (array.indexOf(item) === -1) {
            array.push(item);
        }
    }


    removeItem(array: number[], item: number) {
        let index = array.indexOf(item);
        if (index >= 0) {
            array.splice(index, 1);
        }
    }

    showError(msg: string) {
        let confirm = this.alertCtrl.create({
            title: '错误',
            subTitle: msg,
            buttons: ['OK']
        });
        confirm.present();
    }

    showInfo(msg: string) {
        let confirm = this.alertCtrl.create({
            subTitle: msg,
            buttons: [
                {
                    text: 'OK',
                    handler: () => {

                    }
                }]
        });
        confirm.present();
    }


}