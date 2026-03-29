import { createClient } from '@supabase/supabase-js';
import ProductClient from './ProductClient';
import { Suspense } from 'react';

export const dynamicParams = false;

// Required for static export
export async function generateStaticParams() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return [{ id: 'view' }];
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data: deals } = await supabase
    .from('hardware_deals')
    .select('id');

  const ids = new Set((deals || []).map((deal) => String(deal.id)));
  ids.add('view');
  return Array.from(ids).map((id) => ({ id }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}>
      <ProductClient id={id} />
    </Suspense>
  );
}
