import React from 'react';
import { ChemicalTest } from '@/lib/firebase-tests';
import TestPrintPageClient from './TestPrintPageClient';

// Generate static params for all possible test IDs
export async function generateStaticParams() {
  // Return empty array to allow dynamic generation
  return [];
}

interface TestPrintPageProps {
  params: {
    testId: string;
  };
}

export default function TestPrintPage({ params }: TestPrintPageProps) {
  return <TestPrintPageClient testId={params.testId} />;
}
