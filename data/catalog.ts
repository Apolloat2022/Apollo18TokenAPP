// data/catalog.ts
// Single source of truth for everything sold through Apollo18 checkout.
// Each SKU maps 1:1 to a Stripe product/price in Phase 2 (see PLAN.md §2).

import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type CourseModule = {
  title: string;
  description: string;
  icon: IoniconName;
  // Metered modules debit AI Tutor credits per query instead of issuing a
  // completion credential directly.
  usesCredits?: boolean;
};

export type CourseItem = {
  sku: string;
  type: 'course';
  title: string;
  level: string;
  description: string;
  priceUsd: number;
  modules: CourseModule[];
  comingSoon?: boolean;
};

export type CreditPackItem = {
  sku: string;
  type: 'credits';
  title: string;
  credits: number;
  priceUsd: number;
  comingSoon?: boolean;
};

export type CatalogItem = CourseItem | CreditPackItem;

export const catalog: CatalogItem[] = [
  {
    sku: 'course-prompt-mastery',
    type: 'course',
    title: 'Prompt Engineering Mastery',
    level: 'ADVANCED',
    description: '2026 Professional Curriculum',
    priceUsd: 99,
    modules: [
      {
        title: 'Module 1: Semantic Anchoring',
        icon: 'documents',
        description:
          'Learn how to use high-density semantic anchors to pin LLM reasoning across complex contexts.',
      },
      {
        title: 'Module 2: Agentic Loop Design',
        icon: 'git-network',
        description:
          'Building recursive feedback loops for autonomous problem solving and error correction.',
        usesCredits: true,
      },
      {
        title: 'Module 3: Responsible AI Use',
        icon: 'shield-checkmark',
        description:
          'Best practices for using AI tools safely, ethically, and effectively.',
      },
    ],
  },
  {
    sku: 'course-agentic-loops',
    type: 'course',
    title: 'Mastering AI Agentic Loops',
    level: 'ADVANCED',
    description: 'From reflection loops to autonomous swarms',
    priceUsd: 149,
    comingSoon: true,
    modules: [],
  },
  // 1 credit = $0.01 (PLAN.md §1 Option A)
  { sku: 'credits-500', type: 'credits', title: 'Starter Credits', credits: 500, priceUsd: 5 },
  { sku: 'credits-2500', type: 'credits', title: 'Builder Credits', credits: 2500, priceUsd: 25 },
  { sku: 'credits-10000', type: 'credits', title: 'Pro Credits', credits: 10000, priceUsd: 100 },
];
