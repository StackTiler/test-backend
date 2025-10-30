export type Availability = "in stock" | "out of stock" | "pre-order";
export interface Garment {       
  name: string;
  description: string;
  price: number;
  size: string;                 
  availability: Availability;
  vendor: string;
  categories: string;
  images: string[];
  tags: string[];
  createdAt: Date;             
  updatedAt: Date;
}