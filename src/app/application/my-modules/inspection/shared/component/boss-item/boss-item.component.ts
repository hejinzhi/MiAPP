import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'sg-boss-item',
  templateUrl: 'boss-item.component.html'
})
export class BossItemComponent implements OnInit {
  @Input()
  item:any;
  constructor() { }

  ngOnInit() {
  }

}
