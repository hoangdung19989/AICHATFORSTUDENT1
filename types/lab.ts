import type { ComponentType } from 'react';

export interface PhetSimulation {
  id: string;
  title: string;
  description: string;
  embedUrl: string;
}

export interface LabCategory {
  id: string;
  name: string;
  subcategories?: LabCategory[];
  icon?: ComponentType<{ className?: string }>;
  color?: string;
  description?: string;
}
