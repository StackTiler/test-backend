/**
 * ============================================================================
 * Garment Domain Model Interface
 * ============================================================================
 *
 * WORKFLOW OVERVIEW:
 * Defines TypeScript interface for garment products.
 * Ensures type safety across controllers, services, and repositories.
 *
 * FIELDS:
 * - name: Product name (required)
 * - description: Detailed product description (required)
 * - price: Product price in currency (required)
 * - size: Product size specification (required)
 * - availability: Stock status enum (in stock, out of stock, pre-order)
 * - vendor: Supplier/manufacturer name (required)
 * - categories: Product category for filtering (required)
 * - images: Array of image file paths (for product gallery)
 * - tags: Array of search tags for SEO/filtering
 * - timestamps: Auto-managed by MongoDB schema
 *
 * ============================================================================
 */

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
