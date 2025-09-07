import { CompanyAccessException, ResourceNotInCompanyException } from './company-access.exception';
import { HttpStatus } from '@nestjs/common';

describe('Company Access Exceptions', () => {
  describe('CompanyAccessException', () => {
    it('should create exception with default message', () => {
      const exception = new CompanyAccessException();
      
      expect(exception.getStatus()).toBe(HttpStatus.FORBIDDEN);
      expect(exception.getResponse()).toEqual({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'No tienes acceso a los datos de esta empresa',
        error: 'Forbidden - Company Access Denied',
      });
    });

    it('should create exception with custom message', () => {
      const customMessage = 'Acceso denegado a la empresa';
      const exception = new CompanyAccessException(customMessage);
      
      expect(exception.getStatus()).toBe(HttpStatus.FORBIDDEN);
      expect(exception.getResponse()).toEqual({
        statusCode: HttpStatus.FORBIDDEN,
        message: customMessage,
        error: 'Forbidden - Company Access Denied',
      });
    });
  });

  describe('ResourceNotInCompanyException', () => {
    it('should create exception with resource type and ID', () => {
      const resourceType = 'Usuario';
      const resourceId = 'user-123';
      const exception = new ResourceNotInCompanyException(resourceType, resourceId);
      
      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(exception.getResponse()).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Usuario con ID user-123 no encontrado o no pertenece a tu empresa',
        error: 'Not Found - Resource Not In Company',
      });
    });

    it('should create exception with different resource types', () => {
      const resourceType = 'Lista';
      const resourceId = 'list-456';
      const exception = new ResourceNotInCompanyException(resourceType, resourceId);
      
      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(exception.getResponse()).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Lista con ID list-456 no encontrado o no pertenece a tu empresa',
        error: 'Not Found - Resource Not In Company',
      });
    });
  });
});
