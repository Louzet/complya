import type { Cuid, CountryCode, CurrencyCode } from './common.types';

export interface Company {
  id: Cuid;
  orgId: Cuid;
  name: string;
  nif: string | null;
  cnssNumber: string | null;
  cnamgsNumber: string | null;
  country: CountryCode;
  currency: CurrencyCode;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyDto {
  name: string;
  nif?: string;
  cnssNumber?: string;
  cnamgsNumber?: string;
  country?: CountryCode;
  currency?: CurrencyCode;
}

export interface UpdateCompanyDto {
  name?: string;
  nif?: string;
  cnssNumber?: string;
  cnamgsNumber?: string;
}
