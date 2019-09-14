import { Component, OnInit, OnDestroy } from '@angular/core';
import { Championship } from '../../models/championship.model';
import { Subscription } from 'rxjs';
import { ChampionshipService } from '../../services/championship.service';

@Component({
  selector: 'app-explanation',
  templateUrl: './explanation.component.html',
  styleUrls: ['./explanation.component.scss']
})
export class ExplanationComponent implements OnInit,OnDestroy {

  private championship: Championship;
  private subscription: Subscription;

  constructor(private championshipService: ChampionshipService) { 
    this.subscription = this.championshipService.getState().subscribe(championship=> {
      this.championship=championship;
    });
  }

  ngOnInit() {

  }

  ngOnDestroy()
  {
    this.subscription.unsubscribe();
  }

}
