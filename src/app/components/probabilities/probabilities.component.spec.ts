import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbabilitiesComponent } from './probabilities.component';

describe('ProbabilitiesComponent', () => {
  let component: ProbabilitiesComponent;
  let fixture: ComponentFixture<ProbabilitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProbabilitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProbabilitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
