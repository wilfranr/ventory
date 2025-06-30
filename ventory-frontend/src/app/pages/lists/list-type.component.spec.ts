import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTypesComponent } from './list-types.component';

describe('ListTypesComponent', () => {
  let component: ListTypesComponent;
  let fixture: ComponentFixture<ListTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
