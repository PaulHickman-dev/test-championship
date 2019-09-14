export class Schedule {
    home: string;    
    away: string;
    matches: number;

    constructor(home: string, away: string, matches: number) 
    {
        //Name of the home team
        this.home = home;
        //Name of the away team
        this.away = away;
        //Number of matches in the series
        this.matches = matches;
    }
}
