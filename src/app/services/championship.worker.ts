/// <reference lib="webworker" />

import { DoWork, ObservableWorker } from 'observable-webworker';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Championship } from '../models/championship.model';
import { Results } from '../models/results.model';
import { Standing } from '../models/standing.model';

class List<Item> extends Array<Item> {
  Max<Selected>(select: (item: Item) => Selected): Item {
    return this.reduce( (a: Item, b: Item): Item => select(a) > select(b) ? a : b );
  }
}

@ObservableWorker()
export class ResultsWorker implements DoWork<Championship, Results> {

  log: boolean;

  public work(input$: Observable<Championship>): Observable<Results> {

    return input$.pipe(
      map(data => this.RunChampionship(data))
    );
  }


  //This method runs the calculation. If you are interested in verifying the correctness
  //of the simluatiion, this is where to look  
  RunChampionship(c:Championship):Results
  {
    
    this.log=false;
    this.report(JSON.stringify(c,null,1));
    let { unpenalised, penalised }: { unpenalised: List<Standing>; penalised: List<Standing>; } = this.initialise(c);

    let penalisedTies:number=0;
    let unpenalisedTies:number=0;
    let penaltiesEffective:number=0;

    //Run the championship the number of times specified in c.shard
    for (let i = 0; i < c.shard; i++)
    {
      //Clear results of previous run
      this.clear(c, unpenalised, penalised);

      //Simulate series for all home/away combinations
      for (let home=0;home<c.teams.length;home++)
      {
          for(let away=0;away<c.teams.length;away++)
          {
              this.runSeries(c,unpenalised,penalised,home,away);
          }
      }

      //Work out who the wining teams (could be tied) are and how many penalty points they have
      let top2penalised: List<number>;
      ({ out: top2penalised, ties: penalisedTies } = this.getWinners(penalised, c, penalisedTies,true));

      //Work out who would have won without any penalties for slow over rates being applied
      let top2unpenalised: List<number>;
      ({ out: top2unpenalised, ties: unpenalisedTies } = this.getWinners(unpenalised, c, unpenalisedTies,false));

      //See if penalties made any difference to the outcome
      //(note: top2 may actually contain more than 2 teams if there were ties for 2nd place)
      if (top2penalised.sort().join(',') !== top2unpenalised.sort().join(','))
      {
        penaltiesEffective++;
      }
      this.log=false;

    }
    
    //Send the results back to the championship-service
    var result = new Results(c.teams,penaltiesEffective,penalisedTies,unpenalisedTies,c.count,"complete",c.run);
    this.report(JSON.stringify(result,null,1));
    return result;
  
  }

  //Perform one-time setup that doesn't need to be repeated every run of the simulation
  private initialise(c: Championship) {
    let penalised: List<Standing> = new List<Standing>();
    let unpenalised: List<Standing> = new List<Standing>();
    
    for(let i=0;i<c.teams.length;i++)
    {
      c.teams[i].penalisedWins = c.teams[i].unpenalisedWins = c.teams[i].penalties=0;
      penalised.push(new Standing());
      unpenalised.push(new Standing());
    }
    return { unpenalised, penalised };
  }

  //Clear the results of a previous run between runs
  private clear(c: Championship, unpenalised: List<Standing>, penalised: List<Standing>) {
    for (let j = 0; j < c.teams.length; j++) {
      unpenalised[j].points = penalised[j].points = 0.0;
      unpenalised[j].series = penalised[j].series = 0;
    }
  }

  private report(msg: string)
  {
    if (this.log)
    {
      console.log(msg);
    }
  }

  //Simulate a series between two particular teams
  private runSeries(c: Championship, unpenalised: List<Standing>, penalised: List<Standing>, home: number, away: number) {
    
    //Calculate number of matches in the series
    let matches = c.teams[home].matches[away];
    if (matches === 0 || matches == undefined) return;// Teams don't play
    //Calculate the points per match
    let pointsPerMatch = c.seriesPoints[matches] / matches;

    //Calculate the penalty points per over in this series
    let penaltyPerMatch = c.scalePenalties ? pointsPerMatch*0.05 : 2;

    //Initialse the win counts
    let homeWins:number = 0;
    let awayWins:number = 0;
    this.report(c.teams[home].name + " vs " + c.teams[away].name + ' - ' + matches.toString() + " matches");

    //Simulate the result of each match
    for(let m=0;m<matches;m++)
    {
      //Pick a random number floating point number greater than or equal to 0 and less than 1 to represent the result of the match
      let result:number = Math.random();

      //Test if that number represents a draw, tie, home win or away win based on the probabilities configured in the championship settings
      if (result>=1.0-c.probabilities.draw/100.0)
      {
          //Draw - according to ICC rules, award both teams 1/3rd of the match points
          penalised[home].points += pointsPerMatch / 3.0;
          penalised[away].points += pointsPerMatch / 3.0;
          unpenalised[home].points += pointsPerMatch / 3.0;
          unpenalised[away].points += pointsPerMatch / 3.0;
          c.teams[home].matchDraws++;
          c.teams[away].matchDraws++;
          this.report("  draw");
      }
      else if (result>=1.0-c.probabilities.draw/100.0-c.probabilities.tie/100.0)
      {
          //Tie - according to ICC rules, award both teams 1/2 of the match points
          penalised[home].points += pointsPerMatch / 2.0;
          penalised[away].points += pointsPerMatch / 2.0;
          unpenalised[home].points += pointsPerMatch / 2.0;
          unpenalised[away].points += pointsPerMatch / 2.0;
          c.teams[home].matchTies++;
          c.teams[away].matchTies++;
          this.report("  tie");
      }
      else if (result>=((1.0 - c.probabilities.draw/100.0 - c.probabilities.tie/100.0) * c.probabilities.away/100.0))
      {
          //Away win
          penalised[away].points += pointsPerMatch;
          unpenalised[away].points += pointsPerMatch;
          c.teams[home].matchLoss++;
          c.teams[away].matchWins++;
          awayWins++;
          this.report("  " + c.teams[away].name + " win");
      }
      else
      {
          //Home win
          penalised[home].points += pointsPerMatch;
          unpenalised[home].points += pointsPerMatch;
          c.teams[away].matchLoss++;
          c.teams[home].matchWins++;
          homeWins++;
          this.report("  " + c.teams[home].name + " win");
      }

      //Pick two random numbers to indicate if the home and away teams are going to incur penalty overs
      let penHome = Math.random();
      let penAway = Math.random();

      for(let k=0;k<10;k++)
      {
        if (penAway < c.probabilities.penalty[k]/100.0)
        {
            //Away slow over rate
            penalised[away].points-=penaltyPerMatch;
            c.teams[away].penalties+=penaltyPerMatch;
            this.report("  " + c.teams[away].name + " slow over penalty");
        }
        if (penHome < c.probabilities.penalty[k]/100.0)
        {
            //Home slow over rate
            penalised[home].points-=penaltyPerMatch;
            c.teams[home].penalties+=penaltyPerMatch;
            this.report("  " + c.teams[home].name + " slow over penalty");
        }
      }
    }

    //Work out won the series
    if (homeWins>awayWins)
    {
        penalised[home].series++;
        unpenalised[home].series++;
        c.teams[away].seriesLoss++;
        c.teams[home].seriesWins++;
    }
    else if (awayWins>homeWins)
    {
        penalised[away].series++;
        unpenalised[away].series++;
        c.teams[home].seriesLoss++;
        c.teams[away].seriesWins++;
    }
    else {
      c.teams[home].seriesDraws++;
      c.teams[away].seriesDraws++;
    }
    this.report("  Result: " + c.teams[home].name + " " + homeWins.toString() + "-" + awayWins.toString() + " " + c.teams[away].name );

  }

  //Examine the standings at the end of a championship simulation to see which teams are in the qualifying places
  //This is called once with penalised = true and one with penalised = false to compare the standings with and without
  //slow over rate penalites being applied.
  private getWinners(standings: List<Standing>, c: Championship, ties: number, penalised: boolean) {

    let top: List<number> = new List<number>();
    let out: List<number> = new List<number>();

    if (this.log)
    {
      console.log((penalised ? "" : "un") + "penalised standings:");
      for(let i=0;i<c.teams.length;i++)
      {
        console.log("  " + c.teams[i].name + " " + standings[i].points + " points, " + standings[i].series + " series, value = " + standings[i].value());
      }
    }
    //Find the teams with most points and use series wins if tied
    let winnerPoints = standings.Max(x => x.value()).value();
    let winners: number = 0;
    for (let j = 0; j < c.teams.length; j++) {
      if (standings[j].value() == winnerPoints) {
        winners++;
        top.push(j);
        out.push(j);
      }
    }

    //If we have more than 2 teams tied for first, remove at random until 2 are left
    //but leave them in the "out" array so the comparison between penalised/unpenalised includes the tied teams
    if (winners>2)
    {
      ties++;    
      while (winners>2)
      {
        let r = Math.floor(Math.random()*winners);
        top.splice(r,1);
        winners--;
      }
    }

    //If we only have one winner, calculate the teams (could be tied) in secound place
    //If we have 2 or more winners we don't need to look at second place to find qualifiers
    if (winners < 2) {
      let secondPoints = standings.Max(x => x.value() == winnerPoints ? -10000 : x.value()).value();
      let seconds=0;
      for (let j = 0; j < c.teams.length; j++) {
        if (standings[j].value() == secondPoints) {
          seconds++;
          top.push(j);
          out.push(j);
        }
      }
      //If we have a tie for second, remove them until only one left
      if (seconds>1)
      {
        ties++
        while (seconds>1)
        {
          let r = 1+Math.floor(Math.random()*seconds);
          top.splice(r,1);
          seconds--;  
        }
      }
    }

    //Increment the win counts for the two teams that qualified - here a champioship "win" means being in the top two places
    for(let i of top) {
      if (penalised) {
        c.teams[i].penalisedWins++;
      }
      else {
        c.teams[i].unpenalisedWins++;
      }
    }

    return { out, ties };
  }

  
}
