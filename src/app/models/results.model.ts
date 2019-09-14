import { Team } from './team.model';

export class Results {
    teams: Team[];    
    penaltiesEffective: number;
    penalisedTies: number;
    unpenalisedTies: number;
    count: number;
    status: string;
    run: number;

    constructor(teams: Team[], penaltiesEffective: number, penalisedTies: number, unpenalisedTies: number, count: number, status: string, run: number) 
    {
		//List of teams in the championship
        this.teams = teams;
		//Array of count of the number of simulations in which slow over penalties changed whether each team qualified
        this.penaltiesEffective = penaltiesEffective;
		//Count of the number of simulations in which 2 or more teams where tied for 2nd place, after taking into account slow over penalties
        this.penalisedTies = penalisedTies;
		//Count of the number of simulations in which 2 or more teams where tied for 2nd place, before taking into account slow over penalties
        this.unpenalisedTies = unpenalisedTies;
		//Number of simulations performed
        this.count = count;
        //"running" or "completed" to indicate if the results are final or provisional
        this.status = status;
        //Shard number of the shard of the championship that these are the results of
        this.run = run;
    }
}
