import { TestBed } from '@angular/core/testing';

import { ChampionshipService } from './championship.service';

describe('ChampionshipServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChampionshipService = TestBed.get(ChampionshipService);
    expect(service).toBeTruthy();
  });
});
