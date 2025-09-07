export interface ThirdParty {
  id: string;
  name: string;
  nit: string;
  address?: string;
  phones?: string;
  email?: string;
  website?: string;
  companyId: string;
  client?: Client;
  provider?: Provider;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  creditLimit: number;
  thirdPartyId: string;
  companyId: string;
  thirdParty?: ThirdParty;
  createdAt: string;
  updatedAt: string;
}

export interface Provider {
  id: string;
  paymentTerms?: string;
  bankAccount?: string;
  thirdPartyId: string;
  companyId: string;
  thirdParty?: ThirdParty;
  createdAt: string;
  updatedAt: string;
}

export interface CreateThirdPartyDto {
  name: string;
  nit: string;
  address?: string;
  phones?: string;
  email?: string;
  website?: string;
}

export interface CreateClientDto extends CreateThirdPartyDto {
  creditLimit?: number;
}

export interface CreateProviderDto extends CreateThirdPartyDto {
  paymentTerms?: string;
  bankAccount?: string;
}

export interface UpdateThirdPartyDto {
  name?: string;
  nit?: string;
  address?: string;
  phones?: string;
  email?: string;
  website?: string;
}
