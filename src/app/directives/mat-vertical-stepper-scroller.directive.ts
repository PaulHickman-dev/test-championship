import { Directive, HostListener } from '@angular/core';
import { MatStepper } from '@angular/material';
import { StepperSelectionEvent } from '@angular/cdk/stepper';

//This component makes the correct part of the page scroll into view as you expand/collapse the steps
@Directive({
  selector: '[MatVerticalStepperScroller]',
})
export class MatVerticalStepperScrollerDirective {
  constructor(private stepper: MatStepper) {}

  @HostListener('selectionChange', ['$event'])
  selectionChanged(selection: StepperSelectionEvent) {
    const stepId = this.stepper._getStepLabelId(selection.selectedIndex - 1);
    const stepElement = document.getElementById(stepId);
    if (stepElement) {
      setTimeout(() => {
        stepElement.scrollIntoView(true);
      }, 250);
    }
  }
}