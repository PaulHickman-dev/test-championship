import { Component, OnInit, ViewChild } from '@angular/core';
import { Team } from '../../models/team.model';
import { Schedule } from '../../models/schedule.model';
import { ScheduleComponent } from '../schedule/schedule.component';
import { FormGroup } from '@angular/forms';
import { TeamsComponent } from '../teams/teams.component';
import { Probabilities } from '../../models/probabilities.model';
import { ResultsComponent } from '../results/results.component';
import { ProbabilitiesComponent } from '../probabilities/probabilities.component';
import { ChampionshipService } from '../../services/championship.service';
import { Championship } from '../../models/championship.model';

//This component is the top level of the user inteface
@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.scss']
})
export class SimulatorComponent implements OnInit {

  constructor(private championshipService : ChampionshipService) { }

  @ViewChild('Teams',{ static: false}) teamsComponent: TeamsComponent;
  @ViewChild('Schedule',{ static: false}) scheduleComponent: ScheduleComponent;
  @ViewChild('Results',{ static: false}) resultsComponent: ResultsComponent;
  @ViewChild('Probabilities', {static: false}) probabilitiesComponent: ProbabilitiesComponent;

  teamFormGroup: FormGroup;

  scheduleFormGroup: FormGroup;

  probabilitiesFormGroup: FormGroup;

  //This model define the default settings for the championship which is the real-world
  //model ofthe 2019-2012 season
  championship:Championship = new Championship(
    [ //Teams
      new Team('Australia'),
      new Team('Bangladesh'),
      new Team('England'),
      new Team('India'),
      new Team('New Zealand'),
      new Team('Pakistan'),
      new Team('South Africa'),
      new Team('Sri Lanka'),
      new Team('West Indies')
    ],
    [ //Schedule
      new Schedule("England", "Australia", 5),
      new Schedule("Sri Lanka", "New Zealand", 2),
      new Schedule("West Indies", "India", 2),
      new Schedule("India", "South Africa", 3),
      new Schedule("Pakistan", "Sri Lanka", 2),
      new Schedule("Australia", "Pakistan", 2),
      new Schedule("India", "Bangladesh", 2),
      new Schedule("Australia", "New Zealand", 3),
      new Schedule("South Africa", "England", 4),
      new Schedule("Pakistan", "Bangladesh", 2),
      new Schedule("Bangladesh", "Australia", 2),
      new Schedule("New Zealand", "India", 2),
      new Schedule("Sri Lanka", "England", 2),
      new Schedule("England", "West Indies", 3),
      new Schedule("England", "Pakistan", 3),
      new Schedule("Sri Lanka", "Bangladesh", 3),
      new Schedule("West Indies", "South Africa", 2),
      new Schedule("Bangladesh", "New Zealand", 2),
      new Schedule("Australia", "India", 4),
      new Schedule("New Zealand", "West Indies", 3),
      new Schedule("New Zealand", "Pakistan", 2),
      new Schedule("Bangladesh", "West Indies", 3),
      new Schedule("India", "England", 5),
      new Schedule("Pakistan", "South Africa", 2),
      new Schedule("South Africa", "Sri Lanka", 2),
      new Schedule("South Africa", "Australia", 3),
      new Schedule("West Indies", "Sri Lanka", 2)
    ],
    new Probabilities(
      14.5, //Draw - estimated from Cricinfo stats guru over the last 5 years
      0.1,//Tie - estimated from Cricinfo stats guru
      50, //Away
      [10,8,6,5,4,3,2,1,0.5,0.25] //Slow Over Rate - estimated from cricinfo article
    ),
    250000 //Iterations
  );
  
  ngOnInit() {
    this.championshipService.setState(this.championship);
  }

  get bindTeamFormGroup()
  {
    return this.teamsComponent ? this.teamsComponent.form : null;
  }

  get bindScheduleFormGroup()
  {
    return this.scheduleComponent ? this.scheduleComponent.form : null;
  }
  
  get bindProbabilitiesFormGroup()
  {
    return this.probabilitiesComponent ? this.probabilitiesComponent.form : null;
  }

}
