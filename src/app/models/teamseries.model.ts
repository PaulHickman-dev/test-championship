//This model is used to produe the summary report on the number of series each team plays on the Schdule configuraton page
//It is not used during the simulation - only to help implement the configuration interface
export class TeamSeries {
    name: string;
    awayMatches: number;
    homeMatches: number;
    awaySeries: number;
    homeSeries: number;
    

    constructor(name: string) 
    {
        this.name = name;
        this.awayMatches = this.homeMatches = this.awaySeries = this.homeSeries = 0;
    }

}
