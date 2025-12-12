import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AiPairingsPage } from './ai-pairings.page';

describe('AiPairingsPage', () => {
  let component: AiPairingsPage;
  let fixture: ComponentFixture<AiPairingsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AiPairingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
