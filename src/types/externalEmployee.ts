export interface ExternalEmployee {
  id: number;
  firstName: string;
  lastName: string;
  maidenName: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  username: string;
  image: string;
  company: {
    name: string;
    department: string;
    title: string;
  };
}

export interface ExternalEmployeeResponse {
  users: ExternalEmployee[];
  total: number;
  skip: number;
  limit: number;
}
