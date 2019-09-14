import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Results } from '../../models/results.model';
import { ChampionshipService } from '../../services/championship.service';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit, OnDestroy {

  public results:Results = new Results([],0,0,0,1,"notstarted",0)
  private subscription: Subscription;
  public displayedColumns=[ 'team','series','matches','penalised','bias','unpenalised','ubias','change'];
  public displayedColumns2=[ 'team','series','seriesWins','seriesDraws','seriesLoss','matches','matchWins','matchTies','matchDraws','matchLoss'];
  public dataSource = new MatTableDataSource(this.results.teams);
  public dataSource2 = new MatTableDataSource(this.results.teams);

  @ViewChild('sort',null) sort: MatSort;
  @ViewChild('sort2',null) sort2: MatSort;

  constructor(private championshipService: ChampionshipService) { 
    this.subscription = this.championshipService.getResults().subscribe(results=> {
      this.results=results;
      this.sortData(this.sort);
      this.sortData2(this.sort2);
    });
  }

  ngOnInit() {
    this.dataSource.sort = this.sort;
    this.dataSource2.sort = this.sort2;
  }

  ngOnDestroy()
  {
    this.subscription.unsubscribe();
  }

  sortData(sort: Sort) {
    let active='penalised';
    let isAsc = false;
    if (sort !== undefined && sort.active && sort.direction !== '') {
      active=sort.active;
      isAsc=sort.direction === 'asc';
    }

    let clone = JSON.parse(JSON.stringify(this.results.teams));
    this.dataSource.data = clone.sort((a, b) => {
      switch (active) {
        case 'team': return compare(a.name, b.name, isAsc);
        case 'series': return compare(a.homeSeries+a.awaySeries, b.homeSeries+b.awaySeries, isAsc);
        case 'matches': return compare(a.homeMatches+a.awayMatches, b.homeMatches+b.awayMatches, isAsc);
        case 'penalised': return compare(a.penalisedWins, b.penalisedWins, isAsc);
        case 'bias': return compare(a.penalisedWins, b.penalisedWins, isAsc);
        case 'unpenalised': return compare(a.unpenalisedWins, b.unpenalisedWins, isAsc);
        case 'ubias': return compare(a.unpenalisedWins, b.unpenalisedWins, isAsc);
        case 'change': return compare(a.penalisedWins-a.unpenalisedWins, b.penalisedWins-b.unpenalisedWins, isAsc);
        default: return 0;

      }
    });
  }

  sortData2(sort: Sort) {
    let active='matchWins';
    let isAsc = false;
    if (sort !== undefined && sort.active && sort.direction !== '') {
      active=sort.active;
      isAsc=sort.direction === 'asc';
    }
    let clone = JSON.parse(JSON.stringify(this.results.teams));    
    this.dataSource2.data = clone.sort((a, b) => {
      switch (active) {
        case 'team': return compare(a.name, b.name, isAsc);
        case 'series': return compare(a.seriesWins+a.seriesDraws+a.seriesLoss, b.seriesWins+b.seriesDraws+b.seriesLoss, isAsc);
        case 'seriesWins': return compare(a.seriesWins/(a.seriesWins+a.seriesDraws+a.seriesLoss), b.seriesWins/(b.seriesWins+b.seriesDraws+b.seriesLoss), isAsc);
        case 'seriesDraws': return compare(a.seriesDraws/(a.seriesWins+a.seriesDraws+a.seriesLoss), b.seriesDraws/(b.seriesWins+b.seriesDraws+b.seriesLoss), isAsc);
        case 'seriesLoss': return compare(a.seriesLoss/(a.seriesWins+a.seriesDraws+a.seriesLoss), b.seriesLoss/(b.seriesWins+b.seriesDraws+b.seriesLoss), isAsc);
        case 'matches': return compare(a.matchWins+a.matchDraws+a.matchTies+a.matchLoss, b.matchWins+b.matchDraws+b.matchTies+b.matchLoss, isAsc);
        case 'matchWins': return compare(a.matchWins/(a.matchWins+a.matchDraws+a.matchTies+a.matchLoss), b.matchWins/(b.matchWins+b.matchDraws+b.matchTies+b.matchLoss), isAsc);
        case 'matchDraws': return compare(a.matchDraws/(a.matchWins+a.matchDraws+a.matchTies+a.matchLoss), b.matchDraws/(b.matchWins+b.matchDraws+b.matchTies+b.matchLoss), isAsc);
        case 'matchTies': return compare(a.matchTies/(a.matchWins+a.matchDraws+a.matchTies+a.matchLoss), b.matchTies/(b.matchWins+b.matchDraws+b.matchTies+b.matchLoss), isAsc);
        case 'matchLoss': return compare(a.matchLoss/(a.matchWins+a.matchDraws+a.matchTies+a.matchLoss), b.matchLoss/(b.matchWins+b.matchDraws+b.matchTies+b.matchLoss), isAsc);
        default: return 0;
      }
    });
  }


  getTotalBias()
  {
    return this.results.teams.reduce((total,team)=>total+team.penalisedWins/this.results.count-2.0/this.results.teams.length,0);
  }

  getTotalChange()
  {
    return this.results.teams.reduce((total,team)=>total+(team.penalisedWins-team.unpenalisedWins)/this.results.count,0);
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
