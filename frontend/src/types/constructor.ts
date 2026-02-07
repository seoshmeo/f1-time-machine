export interface ConstructorBrief {
  id: number;
  constructor_ref: string;
  name: string;
  full_name?: string;
  nationality?: string;
  url?: string;
  color_primary?: string;
  color_secondary?: string;
}

export interface ConstructorDetail extends ConstructorBrief {
  year?: number;
  drivers?: string[];
}
