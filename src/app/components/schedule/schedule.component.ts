import { Component, OnInit, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { Schedule } from '../../models/schedule.model';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Championship } from '../../models/championship.model';
import { ChampionshipService } from '../../services/championship.service';
import { Subscription } from 'rxjs';
import { TeamSeries } from '../../models/teamseries.model';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit, OnDestroy {

  public lengths: number[] = [2,3,4,5];
  
  @Output() formLink: EventEmitter<FormGroup> = new EventEmitter<FormGroup>()

  
  public championship: Championship;
  private subscription: Subscription;
  public form: FormGroup;
  public displayedColumns=[ 'team','series','matches'];
  public summary: Array<TeamSeries>;
  public dataSource = new MatTableDataSource(this.summary);
  
  @ViewChild(MatSort, {static:true}) sort: MatSort;

  uneven: boolean;
  
  constructor(private formBuilder:FormBuilder,private championshipService:ChampionshipService) { 
    this.subscription = this.championshipService.getState().subscribe(championship=> {
      this.championship=championship;
      this.reloadSchedule();
    });

    this.form = this.formBuilder.group({ series: new FormArray([],[
      Validators.required
    ])});
    
  }

  ngOnInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy()
  {
    this.subscription.unsubscribe();
  }

  public reloadSchedule():void {
    console.log("Reloading schedule for " + this.championship.teams.length.toString());

    //remove any deleted teams from the schedule
    let i=0;
    while (i<this.championship.schedule.length)
    {
        if (!this.championship.teams.find(t=>t.name == this.championship.schedule[i].home) ||
            !this.championship.teams.find(t=>t.name == this.championship.schedule[i].away))
        {
          this.championship.schedule.splice(i,1);
        }
        else {
          i++;
        }
    }
    let arr = this.seriesArray();
    arr.clear();
    this.championship.schedule.map(t=> this.addSeries(t));
  }

  get seriesList() { return <FormArray>this.form.get('series'); }

  addSeries(series: Schedule):void {
    let arr = this.seriesArray();
    let group = this.formBuilder.group({ 
      home: new FormControl(series.home, Validators.required),
      away: new FormControl(series.away, Validators.required),
      matches: new FormControl(series.matches, Validators.required)
    },{ validators: [this.validateDuplicateTeams.bind(this)]});
    
    group.controls.home.valueChanges.subscribe(c=>this.computeSeries());
    group.controls.away.valueChanges.subscribe(c=>this.computeSeries());
    group.controls.matches.valueChanges.subscribe(c=>this.computeSeries());

    arr.push(group);    
    this.computeSeries();
  }

  removeSeries(index: number) {
    let arr = this.seriesArray();
    arr.removeAt(index);
    this.computeSeries();
  }

  submit():void {
    let arr = this.seriesArray();
    this.championship.schedule = arr.controls.map(c=>new Schedule(c.get('home').value,c.get('away').value,c.get('matches').value));
    this.championshipService.setState(this.championship);    
  }

  seriesArray():FormArray {
    return <FormArray>this.form.controls.series;
  }

  hasASeries() {
    let arr = this.seriesArray();
    return arr.length>1;
  }
  
  validateDuplicateTeams(group: FormGroup) {
    var home = group.get('home');
    var away = group.get('away');
    if (home.valid && away.valid && home.value == away.value)
    {
      away.setErrors({ duplicateName: true });
    }
  }

  computeSeries()
  {
    let arr = this.seriesArray();
    this.summary = this.championship.teams.map(team=>new TeamSeries(team.name));

    for(let i=0;i<arr.controls.length;i++)
    {
      let matches = arr.controls[i].get('matches').value;
      let home = this.summary.find(x=>x.name== arr.controls[i].get('home').value);
      let away = this.summary.find(x=>x.name== arr.controls[i].get('away').value);
      
      if (home !== undefined) home.homeSeries+=1;
      if (away !== undefined) away.awaySeries+=1;
      if (home !== undefined && matches!==undefined) home.homeMatches+=matches;
      if (away !== undefined && matches!==undefined) away.awayMatches+=matches;
    }

    let hFirst = this.summary[0].homeSeries;
    let aFirst = this.summary[0].awaySeries;
    this.uneven=false;
    for(let team of this.summary)
    {
      if (team.homeSeries !== hFirst || team.awaySeries !== aFirst)
      {
        this.uneven=true;
      }
    }
    this.sortData(this.sort);
  }

  sortData(sort: Sort) {
    if (sort === undefined || !sort.active || sort.direction === '') {
      this.dataSource.data = this.summary;
      return;
    }

    this.dataSource.data = this.summary.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'team': return compare(a.name, b.name, isAsc);
        case 'series': return compare(a.homeSeries+a.awaySeries, b.homeSeries+b.awaySeries, isAsc);
        case 'matches': return compare(a.homeMatches+a.awayMatches, b.homeMatches+b.awayMatches, isAsc);
        default: return 0;
      }
    });
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
