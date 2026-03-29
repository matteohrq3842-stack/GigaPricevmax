import { createClient } from '@supabase/supabase-js';
import DealClient from './DealClient';

export const dynamicParams = false;

// Required for static export
export async function generateStaticParams() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data: deals } = await supabase
    .from('digital_deals')
    .select('id');

  return (deals || []).map((deal) => ({
    id: String(deal.id),
  }));
}

export default async function DealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DealClient id={id} />;
}
