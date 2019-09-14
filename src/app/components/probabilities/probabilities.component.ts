import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';
import { Probabilities } from '../../models/probabilities.model';
import { Championship } from '../../models/championship.model';
import { Subscription } from 'rxjs';
import { ChampionshipService } from '../../services/championship.service';


@Component({
  selector: 'app-probabilities',
  templateUrl: './probabilities.component.html',
  styleUrls: ['./probabilities.component.scss']
})
export class ProbabilitiesComponent implements OnInit, OnDestroy {

  private championship: Championship;
  private subscription: Subscription;
  public form: FormGroup;
  
  constructor(private formBuilder:FormBuilder, private championshipService: ChampionshipService) {  
    this.subscription = this.championshipService.getState().subscribe(championship=> {
      this.championship=championship;
      this.LoadProbabilities(championship);
    });
    this.form = this.formBuilder.group({});
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      draw : new FormControl(1,[Validators.required,Validators.min(0),Validators.max(100)]),
      tie: new FormControl(1,[Validators.required,Validators.min(0),Validators.max(100)]),
      home: new FormControl(1,[Validators.required,Validators.min(0),Validators.max(100)]),
      away: new FormControl(1,[Validators.required,Validators.min(0),Validators.max(100)]),
      iterations: new FormControl(1,[Validators.required,Validators.min(1),Validators.max(2000000000)]),
      penalty: new FormArray([
        new FormControl(1,[Validators.required,Validators.min(0),Validators.max(100)]),
        new FormControl(1,[Validators.required,Validators.min(0),Validators.max(100)]),
        new FormControl(1,[Validators.required,Validators.min(0),Validators.max(100)]),
        new FormControl(1,[Validators.required,Validators.min(0),Validators.max(100)]),
        new FormControl(1,[Validators.required,Validators.min(0),Validators.max(100)]),

        new FormControl(1,[Validators.required,Validators.min(0),Validators.max(100)]),
        new FormControl(1,[Validators.required,Validators.min(0),Validators.max(100)]),
        new FormControl(1,[Validators.required,Validators.min(0),Validators.max(100)]),
        new FormControl(1,[Validators.required,Validators.min(0),Validators.max(100)]),
        new FormControl(1,[Validators.required,Validators.min(0),Validators.max(100)])
      ],{ validators: [Validators.required,Validators.min(0),Validators.max(100),this.validateSmaller.bind(this)] }
      )
   });
 }

  ngOnDestroy()
  {
    this.subscription.unsubscribe();
  }

  private LoadProbabilities(championship: any) {
    if (this.form.controls.draw) {
      this.form.controls.draw.setValue(championship.probabilities.draw);
      this.form.controls.tie.setValue(championship.probabilities.tie);
      this.form.controls.home.setValue(championship.probabilities.home);
      this.form.controls.away.setValue(championship.probabilities.away);
      this.form.controls.iterations.setValue(championship.count);
      var arr = <FormArray>this.form.controls.penalty;
      for (let i = 0; i < championship.probabilities.penalty.length; i++) {
        arr.controls[i].setValue(championship.probabilities.penalty[i]);
      }
    }
  }

  submit():void {
    this.championship.probabilities = new Probabilities(
      this.form.controls.draw.value,
      this.form.controls.tie.value,
      this.form.controls.away.value,
      [
        (<FormArray>this.form.controls.penalty).controls[0].value,
        (<FormArray>this.form.controls.penalty).controls[1].value,
        (<FormArray>this.form.controls.penalty).controls[2].value,
        (<FormArray>this.form.controls.penalty).controls[3].value,
        (<FormArray>this.form.controls.penalty).controls[4].value,

        (<FormArray>this.form.controls.penalty).controls[5].value,
        (<FormArray>this.form.controls.penalty).controls[6].value,
        (<FormArray>this.form.controls.penalty).controls[7].value,
        (<FormArray>this.form.controls.penalty).controls[8].value,
        (<FormArray>this.form.controls.penalty).controls[9].value
      ]);
    this.championship.count = this.form.controls.iterations.value;
    this.championshipService.setState(this.championship);
    this.championshipService.start(this.championship);
  }

  balanceHomeAway(editHome:boolean):void {
    let home = this.form.controls.home;
    let away = this.form.controls.away;
    let from = editHome ? home : away;
    let to = editHome ? away :home;
    to.setValue(100-from.value);
  }

  validateSmaller() {
    if (this.form)
    {
      let arr = <FormArray>this.form.controls.penalty;
      if (arr)
      {
        for(let i=1;i<arr.controls.length;i++)
        {
          if (arr.controls[i].value>arr.controls[i-1].value)
          {
            arr.controls[i].setErrors( { tooSmall: true });
          }          
          else if (arr.controls[i].invalid)
          {
            arr.controls[i].updateValueAndValidity();
          }
        }
        
      }
    }
  }

  zeroSlowOverRate(start: number) {
    if (this.form)
    {
      let arr = <FormArray>this.form.controls.penalty;
      if (arr)
      {
        for(let i=arr.controls.length-1;i>=start;i--)
        {
          arr.controls[i].setValue(0);          
        }
      }
    }
  }

  

}
