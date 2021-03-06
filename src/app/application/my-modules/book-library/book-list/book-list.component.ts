import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LanguageConfig } from '../shared/config/language.config';

@Component({
    selector: 'sg-book-list',
    templateUrl: 'book-list.component.html'
})
export class BookListComponent {
    @Input() books: any[];
    @Input() showAddBookInput: boolean = false; // 是否显示input输入框
    @Input() showPayBackDate: boolean = false;  // 是否显示“应归还时间”
    @Input() showActualBackDate: boolean = false;  // 是否显示“实际归还时间”
    @Output() onClick = new EventEmitter();
    @Output() onInputChange = new EventEmitter();

    addBookQty: number = 1; // 要添加的图书数量


    constructor() {
        this.addBookQty = 1;
    }

    compareDate(date: any) {
        let nowDate = new Date().getTime();
        let shouldPaybackDate = new Date(date).getTime();
        if (shouldPaybackDate < nowDate) {
            return 'red';
        } else {
            return '';
        }
    }


    ionViewWillEnter() {
        this.addBookQty = 1;
    }

    goToDetailPage(book: any): void {
        this.onClick.emit(book);
    }

    inputChange(event: any) {
        this.onInputChange.emit(event.target.value);
    }

    trackByBooks(index: number, book: any) {
        return book.ISBN13;
    }

}
