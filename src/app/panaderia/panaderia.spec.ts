import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Panaderia } from './panaderia';

describe('Panaderia', () => {
  let component: Panaderia;
  let fixture: ComponentFixture<Panaderia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Panaderia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Panaderia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
