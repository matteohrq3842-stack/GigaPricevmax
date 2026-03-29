'use client';

import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/providers/SessionProvider';
import { useSearchParams } from 'next/navigation';

type ActuGaming = {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string;
  url: string;
  created_at: string;
};

function ArticleContent() {
  const { supabase } = useAuth();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [article, setArticle] = useState<ActuGaming | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      if (!id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('actu_gaming')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setArticle(data);
      } catch (err) {
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [supabase, id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0B0C15] text-white pt-32 pb-24 flex items-center justify-center">
        <div className="text-xl text-gray-400">Chargement de l&apos;article...</div>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-[#0B0C15] text-white pt-32 pb-24 flex flex-col items-center justify-center gap-6">
        <div className="text-xl text-red-400">Article introuvable</div>
        <Link href="/nouveaute-semaine" className="bg-[#8B5CF6] px-6 py-2 rounded-lg hover:bg-[#7C3AED] transition">
          Retour aux nouveautés
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0C15] text-white pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        {/* Navigation Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/nouveaute-semaine" className="hover:text-white transition-colors">
            Nouveautés
          </Link>
          <span>/</span>
          <span className="text-[#8B5CF6] font-semibold truncate max-w-[300px]">
            {article.title}
          </span>
        </nav>

        <article className="bg-[#14121e] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          {/* Header Image */}
          <div className="relative w-full aspect-video max-h-[500px]">
            {article.image_url ? (
              <Image
                src={article.image_url}
                alt={article.title}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                Aucune image disponible
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#14121e] to-transparent opacity-80"></div>
            
            <div className="absolute bottom-0 left-0 p-8 w-full">
               <div className="mb-4">
                <span className="bg-[#8B5CF6] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#8B5CF6]/20">
                    {article.category === 'avenir' ? 'À venir' : 'Nouveauté'}
                </span>
               </div>
               <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">{article.title}</h1>
               <p className="text-gray-300 text-sm">
                 Publié le {new Date(article.created_at).toLocaleDateString('fr-FR', {
                   weekday: 'long',
                   year: 'numeric',
                   month: 'long',
                   day: 'numeric',
                 })}
               </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 space-y-8">
            <div className="prose prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-gray-300 whitespace-pre-line">
                {article.description}
              </p>
            </div>

            {/* Action Button */}
            <div className="flex justify-end pt-8 border-t border-white/5">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg shadow-[#8B5CF6]/20 flex items-center gap-3 transform hover:-translate-y-1"
              >
                <span>Voir l&apos;offre sur le site officiel</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}

export default function ArticlePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0C15] flex items-center justify-center text-white">Chargement...</div>}>
      <ArticleContent />
    </Suspense>
  );
}
