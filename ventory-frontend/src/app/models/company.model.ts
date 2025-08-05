export interface Company {
  id: string;
  name: string;
  nit: string;
  logo?: string;
  users: {
    name: string;
    email: string;
  }[];
}