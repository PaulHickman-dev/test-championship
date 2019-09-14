import { Component, OnInit, Output, OnDestroy } from '@angular/core';
import { Team} from '../../models/team.model';
import { FormArray, FormBuilder,FormGroup,FormControl, Validators } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { ChampionshipService } from '../../services/championship.service';
import { Championship } from '../../models/championship.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss']
})
export class TeamsComponent implements OnInit, OnDestroy {


  @Output() formLink: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();          

  private championship: Championship;
  private subscription: Subscription;
  public form: FormGroup;

  constructor(private formBuilder: FormBuilder, private championshipService: ChampionshipService) { 
    this.subscription = this.championshipService.getState().subscribe(championship=>this.championship=championship);

    this.form = this.formBuilder.group({ teams: new FormArray([],[
      Validators.required,
      this.onValidateTeams.bind(this)
    ])});
  }

  ngOnInit() {
    this.addTeams();
  }

  ngOnDestroy()
  {
    this.subscription.unsubscribe();
  }

  get teamsList() { return <FormArray>this.form.get('teams'); }

  addTeams():void {
    this.championship.teams.map(t=> this.addTeam(t.name));
  }


  addTeam(name: string):void {
    let arr = this.teamsArray();
    arr.push(new FormControl(name,[Validators.required,Validators.maxLength(30)]));

  }

  removeTeam(index: number) {
    let arr = this.teamsArray();
    arr.removeAt(index);
  }

  submit():void {
    let arr = this.teamsArray();
    this.championship.teams = arr.controls.map(c=>new Team(c.value));
    this.championshipService.setState(this.championship);
  }

  teamsArray():FormArray {
    return <FormArray>this.form.controls.teams;
  }
  onValidateTeams() {

    if (this.form)
    {
      let arr = this.teamsArray();
      if (arr) {
    
        let counts = [];
    
        for (let i = 0; i < arr.length; i++) {
          if (counts[arr.value[i]] === undefined) {
            counts[arr.value[i]] = 1;
          } else {
            arr.controls[i].setErrors({duplicateName: true});            
          }
        }
      }
    }
  }

  hasDuplicateNames() {
    let arr = < FormArray >this.form.controls.teams
    if (arr) {
      return  arr.hasError('duplicateName');
    }
    return false;
  }

  hasTwoTeams() {
    let arr = this.teamsArray();
    return arr.length>2;
  }
  

}

