import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { SimulatorComponent } from './components/simulator/simulator.component';
import { TeamsComponent } from './components/teams/teams.component';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { ProbabilitiesComponent } from './components/probabilities/probabilities.component';
import { ResultsComponent } from './components/results/results.component';
import { ExplanationComponent } from './components/explanation/explanation.component';
import { MatVerticalStepperScrollerDirective } from './directives/mat-vertical-stepper-scroller.directive';
import { ChampionshipService } from './services/championship.service';

@NgModule({
  declarations: [
    AppComponent,
    SimulatorComponent,
    TeamsComponent,
    ScheduleComponent,
    ProbabilitiesComponent,
    ResultsComponent,
    ExplanationComponent,
    MatVerticalStepperScrollerDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatTableModule,
    MatSelectModule,
    MatInputModule,
    MatStepperModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatCardModule
  ],
  providers: [
    ChampionshipService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
