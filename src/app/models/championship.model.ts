import { Schedule } from './schedule.model';
import { Probabilities } from './probabilities.model';
import { Team } from './team.model';

export class Championship {
    teams: Team[]
    schedule: Schedule[]
    seriesPoints: number[]
    probabilities: Probabilities
    count: number
    status: string
    uneven: boolean
    shard: number
    run: number
    scalePenalties: boolean

    constructor(teams: Team[], schedule: Schedule[], probabilities: Probabilities, count: number)
    {
        //Array of the teams that are competing
        this.teams = teams;
        //Array of the series that will take place during each simulated championship
        this.schedule =schedule;
        //Confguraition settings for the probabilities of various events that affect the results
        this.probabilities =probabilities;
        //Number of times the championship is to be simulated
        this.count = count;
        //String indicating how far the user has got through the workflow of configuring and running the simulation
        this.status = "notstarted";
        //True if the schedule doesn't have every team playing the same number of home series and the same number of away series
        this.uneven=false;

        //Number of points allocated to series of N matches (0 and 1 match series aren't simulated so these are zero)
        //These are the offical number of ICC rules
        this.seriesPoints = [0,0,120,120,120,120];
        //I've found if you used these numbers, you get a roughly fair competition!
        //this.seriesPoints = [0,0,1006,1041,1064,1080];

        //true if slow over rate penalties should be scaled to be a fraction of the number of points for winning the match. 
        //false to use the actual ICC rule of always being 2 points per slow over
        this.scalePenalties =false;
    }
}