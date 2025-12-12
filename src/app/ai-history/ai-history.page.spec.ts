import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AiHistoryPage } from './ai-history.page';

describe('AiHistoryPage', () => {
  let component: AiHistoryPage;
  let fixture: ComponentFixture<AiHistoryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AiHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
