# Test Championship Simulator

This is a tool to explore the fairness of the ICC Test Championship rules. You can run it online at:

https://paulhickman-dev.github.io/test-championship

It is written in TypeScript using Angular 8. The user interface is written in Angular Material. 

All computation takes place in the browser; the server-side pages are entirely static.

## Checking the accuracy of the calculation

If you are interested in reviewing the calculation for potential bugs, see the files:

* [src/app/models/championship.model.ts](/blob/master/src/app/models/championship.model.ts) which defines the inputs to the simulation
* [src/app/services/championship-worker.ts](/blob/master/src/app/services/championship-worker.ts) which performs the calculation
* [src/app/models/result.model.ts](/blob/master/src/app/models/result.model.ts) which defines holds the results

## Compiling From Source

To build from the source code you need to install:

* [node.js](https://nodejs.org)
* [Angular CLI](https://cli.angular.io/)
* Optionally, the [Visual Studio Code](https://code.visualstudio.com/) text editor

To run the simulator locally, open a command prompt / terminal window in the "src" folder and type:

````batch
ng serve
````


