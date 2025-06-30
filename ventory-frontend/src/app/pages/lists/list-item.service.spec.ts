import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ListItemService } from './list-item.service';
import { SessionService } from '../../services/session.service';

describe('ListItemService', () => {
    let service: ListItemService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: SessionService, useValue: { companyId: '1' } }]
        });
        service = TestBed.inject(ListItemService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch item by id', () => {
        const dummy = { id: 1, listTypeId: 1, name: 'Item', active: true };

        service.getById(1).subscribe((res) => {
            expect(res).toEqual(dummy);
        });

        const req = httpMock.expectOne('/api/list-items/1');
        expect(req.request.method).toBe('GET');
        req.flush(dummy);
    });
});
