import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SimulatorComponent } from './components/simulator/simulator.component';

const routes: Routes = [
  { path: '', component: SimulatorComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
