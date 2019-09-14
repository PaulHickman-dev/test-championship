export class Team {

    //These properties are set whilst configuring the simulation

    //Name of the team
    name: string;
    //Element N in this array is the number matches this team plays in the series played at home against the Nth team in the championship
    //Not all elements are populated as not all teams play each other
    matches: number[];
    //Total number of away matches played by the team in each championship accross all series
    awayMatches: number;
    //Total number of home matches played by the team in each championship accross all series
    homeMatches: number;
    //Total number of away series played by the team in each championship
    awaySeries: number;
    //Total number of home matches played by the team in each championship
    homeSeries: number;


    
    //These properties are accumulated whilst running the simulation
    
    //Total number of simulations where this team qualified (top 2 places) after taking penalty over deductions into account
    penalisedWins: number;
    //Total number of simulations where this team qualified (top 2 places) before taking penalty over deductions into account
    unpenalisedWins: number
    //Total number of penalty overs received by this team in all simulations
    penalties: number;
    //Total number matches won by this team in all simulations
    matchWins: number;
    //Total number matches drawn by this team in all simulations
    matchDraws: number;
    //Total number matches tied by this team in all simulations
    matchTies: number;
    //Total number matches lost by this team in all simulations
    matchLoss: number;
    //Total number series won by this team in all simulations
    seriesWins: number;
    //Total number series drawn by this team in all simulations
    seriesDraws: number;
    //Total number series lost by this team in all simulations
    seriesLoss: number;

    constructor(name: string) 
    {
        this.name = name;
    }

}
