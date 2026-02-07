export interface ConstructorBrief {
  constructor_id: number;
  constructor_ref: string;
  name: string;
  nationality?: string;
  url?: string;
}

export interface ConstructorDetail extends ConstructorBrief {
  year?: number;
  drivers?: string[];
}
