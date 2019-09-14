import { ValueConverter } from '@angular/compiler/src/render3/view/template';

//This is a model used to sort the results by points using series won as a tiebreaker
export class Standing {
    points: number;
    series: number;

    constructor() 
    {
        this.points=0.0;
        this.series=0;
    }

    value():number
    {
        return this.points*100+this.series;
    }
}
