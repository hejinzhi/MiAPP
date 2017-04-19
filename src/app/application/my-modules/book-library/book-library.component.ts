import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, ModalController, MenuController, AlertController, LoadingController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Observable } from 'rxjs/Rx';

import { BookLibraryService } from './shared/service/book-library.service';
import { BookDetailComponent } from './book-detail/book-detail.component';
import { SettingComponent } from './setting/setting.component';
import { BookLibraryConfig } from './shared/config/book-library.config';
import { BorrowedListComponent } from './borrowed-list/borrowed-list.component';
import { BorrowRequestComponent } from './borrow-request/borrow-request.component';

@Component({
    selector: 'sg-book-library',
    templateUrl: 'book-library.component.html'
})
export class BookLibraryComponent implements OnInit {
    constructor(
        public navCtrl: NavController,
        private bookService: BookLibraryService,
        private modalCtrl: ModalController,
        private alertCtrl: AlertController,
        private menuCtrl: MenuController,
        private loadingCtrl: LoadingController,
        private barcodeScanner: BarcodeScanner
    ) { }

    books;
    booksBackup; // 用于备份books的信息。当点击进入明细页面时备份，从明细页面返回时恢复
    user;
    firstIn: boolean = true; // 记录是否第一次打开这个页面，如果是，则显示loading提示框，否则不显示
    pageIndex: number = 1; // 记录当前的页码
    @ViewChild('searchbar') mySearchbar;
    @ViewChild('maincontent') mainContent;
    @ViewChild('bookInput') bookInput;

    ngOnInit() {
        this.user = JSON.parse(localStorage.getItem('currentUser'));
    }

    async ionViewWillEnter() {
        let loading = this.loadingCtrl.create({
            content: 'Please wait...'
        });
        if (this.firstIn) {
            loading.present();
            this.firstIn = false;
        }
        let res;
        if (this.bookInput.value) {
            res = await this.bookService.getBooksByTitle(this.bookInput.value);
        } else {
            let count = this.pageIndex * BookLibraryConfig.pageCount;
            res = await this.bookService.getBooksByPage(1, count);
        }

        this.books = res.json();
        loading.dismiss();
        if (!(localStorage.getItem('scanFlag'))) {
            localStorage.setItem('scanFlag', 'true');
            localStorage.setItem('batchAddBooks', 'true');
        }
    }

    openMenu() {
        this.menuCtrl.toggle();
    }

    exit() {
        this.menuCtrl.close().then(() => {
            this.navCtrl.pop();
        });
    }

    // 转跳到明细页面
    async goToDetailPage(book) {
        let res = await this.bookService.getBookDetailInfo(book.ID);
        this.navCtrl.push(BookDetailComponent, { book: res.json() });
    }

    showSettingModal() {
        let settingPage = this.modalCtrl.create(SettingComponent);
        settingPage.present();
    }

    // 添加图书
    async addBooks() {
        let scanRes = await this.bookService.scan();
        if (scanRes.cancelled) {
            return;
        }
        if (!scanRes.cancelled && scanRes.text.length === 13) {
            let doubanRes = await this.bookService.getBookInfoFromDouban(scanRes.text);
            if (doubanRes.json().code === 6000) {
                this.showError('豆瓣上找不到该书籍的信息，请人工输入.');
            } else {
                let book = this.bookService.transformBookInfo(doubanRes.json());
                this.navCtrl.push(BookDetailComponent, { book: book, type: 'addBook' });
                this.menuCtrl.close();
            }
        } else {
            this.showError('你所扫描的并不是有效的ISBN码');
        }
    }

    showError(msg) {
        let confirm = this.alertCtrl.create({
            title: '错误',
            subTitle: msg,
            buttons: ['OK']
        });
        confirm.present();
    }

    // 下拉加载数据
    async doInfinite(infiniteScroll) {
        this.pageIndex++;
        let res = await this.bookService.getBooksByPage(this.pageIndex, BookLibraryConfig.pageCount);
        let nextPageBooks: any[] = res.json();
        nextPageBooks.forEach((book) => {
            this.books.push(book);
        })

        infiniteScroll.complete();

    }


    // 已预约的图书
    async getOrderBooksInfo() {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        let res = await this.bookService.getOrderBooks(currentUser.username);
        let books = res.json();
        await this.menuCtrl.close();
        this.navCtrl.push(BorrowedListComponent, { books: books, type: 'book' });

    }

    // 已借阅的图书
    async getBorrowedBooks() {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        let res = await this.bookService.getBorrowedBooks(currentUser.username);
        let books = res.json();
        await this.menuCtrl.close();
        this.navCtrl.push(BorrowedListComponent, { books: books, type: 'borrow' });
    }

    // 已归还的图书
    async getPaybackBooks() {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        let res = await this.bookService.getPaybackBooks(currentUser.username);
        let books = res.json();
        await this.menuCtrl.close();
        this.navCtrl.push(BorrowedListComponent, { books: books, type: 'payback' });
    }

    // 借书申请
    borrowRequest() {
        this.borrowPrompt().then(async (username: string) => {
            let res;
            if (username) {
                res = await this.bookService.getOrderBooks(username.toLowerCase());
            } else {
                res = await this.bookService.getOrderBooks();
            }
            let books = res.json();
            await this.menuCtrl.close();
            this.navCtrl.push(BorrowRequestComponent, { books: books });

        });
    }



    // 还书申请
    payBackRequest() {
    }

    // 查询图书
    queryBooks(event) {
        let value = event.target.value;

        Observable.of(event.target.value)
            .debounceTime(500)
            .distinctUntilChanged()
            .switchMap((res) => {
                if (res) {
                    return this.bookService.getBooksByTitle(res);
                }
                else {
                    return this.bookService.getAllBooks();
                }

            })
            .subscribe((resBooks) => {
                this.books = resBooks.json();
            });


    }

    borrowPrompt() {
        return new Promise((resolve, reject) => {
            let alert = this.alertCtrl.create({
                title: '借书申请',
                message: '请输入要借书人的AD',
                inputs: [
                    {
                        name: 'username',
                        placeholder: 'Username'
                    }
                ],
                buttons: [
                    {
                        text: '取消',
                        handler: data => {
                            console.log('Cancel clicked');
                            resolve();
                        }
                    },
                    {
                        text: '确定',
                        handler: data => {
                            resolve(data.username);
                        }
                    }
                ]
            });
            alert.present();
        });

    }


    // for test
    async  addBook() {

        // let isbn13Array = ['9787513506915',
        //     '9787811373226',
        //     '9787544600613',
        //     '9787511206961',
        //     '9787301204580',
        //     '9787562154259',
        //     '9787544628365',
        //     '9787513536509',
        //     '9787544607513',
        //     '9787310020584',
        //     '9787118076554',
        //     '9787544606479',
        //     '9787307080515',
        //     '9787544617277',
        //     '9787544617956',
        //     '9787810950565',
        //     '9787544617765',
        //     '9787544627634',
        //     '9787544619035',
        //     '9787544617383',
        //     '9787810950626',
        //     '9787310028306'
        // ];
        // for (let i = 0; i < isbn13Array.length; i++) {
        //     let doubanRes = await this.bookService.getBookInfoFromDouban(isbn13Array[i]);
        //     let book = this.bookService.transformBookInfo(doubanRes.json());
        //     await this.bookService.addBook(book);
        //     console.log(`insert ${isbn13Array[i]} success`);
        // }

    }



}