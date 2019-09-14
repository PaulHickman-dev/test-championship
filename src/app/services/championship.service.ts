import { Injectable } from '@angular/core';
import { Championship } from '../models/championship.model';
import { Subject, Observable, of } from 'rxjs';
import { fromWorker } from 'observable-webworker';
import { Results } from '../models/results.model';

//This service executes a simulation. It does this by dividing the total number of simulated chamionships to run
//into N-1 shards on an N CPU core system, and then running them in parallel in N-1 worker processes. It then
//waits for each worker to finish and aggregates the results together
@Injectable()
export class ChampionshipService {

  private stateSubject = new Subject<Championship>()

  private resultSubject = new Subject<Results>()

  private runs:number=0;

  private results:Results;

  private shards:Array<number>;

  private completedShards:number;

  private started:number;

  public setState(state: Championship) {
    this.stateSubject.next(state);
  }

  public getState() : Observable<Championship> {
    return this.stateSubject.asObservable();
  }

  public getResults(): Observable<Results> {
    return this.resultSubject.asObservable();
  }

  public start(state: Championship) {
    //Tell subscribers we are running
    this.runs++;
    this.results = new Results(state.teams,0,0,0,state.count,"running",this.runs);
    this.resultSubject.next(this.results);

    //Reset results from preivous runs    
    this.reset(state);

    //Compute who plays who
    this.computeSeries(state);

    //Get the number of worker threads to shard the simulation onto and
    //the number of championships to simulate on each one
    this.shards = this.getShards(state);
    this.completedShards=0;

    this.started = Date.now();
    //Launch each shard in a worker process
    for(let i=0;i<this.shards.length;i++)
    {
      this.runShard(state,this.shards[i]);
    }

  }


  private runShard(championship: Championship, size:number) {

    //Clone the championship so that one worker process doesn't overwrite another's results
    var clone= JSON.parse(JSON.stringify(championship));
    clone.shard = size;
    clone.run = this.runs;

    //Run the shard
    const input$: Observable<Championship> = of(clone);
    var self = this;
    fromWorker<Championship, Results>(() => new Worker('./championship.worker', { type: 'module' }), input$)
      .subscribe(results => 
        {
          //Process the results of the worker

          //Check the results are for the correct simulation in case the user starts a second run before the first finishes
          if (results.run !== this.results.run)
          {
            console.log("Results from wrong run ignored");
            return;
          }

          //Merge the results of this shard back into the overall totals
          self.mergeResults(results);

          //Check if all the shards have finished
          self.completedShards++;
          if (self.completedShards == self.shards.length)
          {
            console.log("Execution duration: "+ (Date.now()-self.started).toString());
            self.results.status="completed";
            //Trigger the user interface to show the results
            self.resultSubject.next(self.results);
          }
          
        } );
  }

  //Merge the results from one shard into the overall results
  private mergeResults(shardResults:Results):void {
    this.results.penalisedTies+=shardResults.penalisedTies;
    this.results.penaltiesEffective+=shardResults.penaltiesEffective;
    this.results.unpenalisedTies+=shardResults.unpenalisedTies;
    for(let i=0;i<this.results.teams.length;i++)
    {
      var t=this.results.teams[i];
      var st= shardResults.teams[i];
      t.matchDraws+=st.matchDraws;
      t.matchLoss+=st.matchLoss;
      t.matchTies+=st.matchTies;
      t.matchWins+=st.matchWins;
      t.penalisedWins+=st.penalisedWins;
      t.penalties+=st.penalties;
      t.seriesDraws+=st.seriesDraws;
      t.seriesLoss+=st.seriesLoss;
      t.seriesWins+=st.seriesWins;
      t.unpenalisedWins+=st.unpenalisedWins;
    }
  }

  //Reset the results from previous runs of a championship
  private reset(state: Championship) {
    for (let team of state.teams) {
      team.matches = new Array<number>(state.teams.length);
      team.penalisedWins = team.penalties = team.unpenalisedWins = team.homeMatches = team.awayMatches = team.homeSeries = team.awaySeries =
        team.seriesDraws = team.seriesLoss = team.seriesWins =
        team.matchDraws = team.matchLoss = team.matchTies = team.matchWins = 0;
    }
  }

  //Use the schedule to set the correct values in the "matches" array of each team in the championship
  private computeSeries(state: Championship) {
    //Convert the schedule into a matches array in each team and reset the results
    for (let team of state.teams) {
      for (let series of state.schedule.filter(x => x.home == team.name)) {
        let awayIndex: number = state.teams.findIndex(x => x.name == series.away);
        let awayTeam = state.teams[awayIndex];
        team.matches[awayIndex] = series.matches;
        team.homeMatches += series.matches;
        team.homeSeries++;
        awayTeam.awayMatches += series.matches;
        awayTeam.awaySeries++;
      }
    }

    let home=state.teams[0].homeSeries;
    let away=state.teams[0].awaySeries;
    state.uneven=false;
    for (let team of state.teams) {
      if (team.homeSeries != home || team.awaySeries != away)
      {
        state.uneven=true;
      }
    }
  }

  //Determine the optimal number of shards to run in parallel to get the results as quickly as possible on this computer
  private getShards(state: Championship):Array<number> 
  {
    
    //Work out how many threads we can use
    let workers = 1;
    if (window !== undefined && window.navigator !== undefined && window.navigator.hardwareConcurrency !== undefined)
    {
      workers = Math.max(1,window.navigator.hardwareConcurrency-1);
    }

    //Compute the number of rounds to put in each shared
    let shards = new Array<number>(workers);
    let shardSize = Math.floor(state.count / workers)
    for(let i=0;i<workers;i++)
    {
        //Put the left over rounds in the first shard
        shards[i]= i==0? state.count-(workers-1)*shardSize : shardSize;
    }
    return shards;
  }
}
