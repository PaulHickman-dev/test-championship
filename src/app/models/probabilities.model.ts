export class Probabilities {
    public draw: number = 20.0;
    public tie: number = 0.1;
    public home: number = 50.0;
    public away: number = 50.0;
    public penalty: Array<number> = [10,8,6,5,4,3,2,1,0.5,0.25];
  
    constructor(draw: number, tie: number, away: number, penalty: Array<number>) 
    {
        //Percentage chance from 0 to 100 of a match being drawn
        this.draw = draw;
        //Percentage chance from 0 to 100 of a match being tied
        this.tie = tie;
        //Percentage chance from 0 to 100 of the away team wining a match that is not drawn or tied
        this.away = away;
        //Percentage chance from 0 to 100 of the home team wining a match that is not drawn or tied
        this.home = 100.0-this.away;
        //Array of 10 elements where element N is the percentage of their being an N-1th penalty over in any given match.
        //Element N should be less than or equal to element N-1 for this to make sense.
        //The simualtor as written at the moment cannot simulate more than 10 penalty overs in the same match.
        this.penalty = penalty;
    }
}
