import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '@/infrastructure/api/ApiService';
import DashboardHeader from '@/components/Header/DashboardHeader.tsx';
import { Button } from '@/components/ui/button';
import { TagRepository } from '@/infrastructure/repositories/TagRepository';

interface Newspaper {
  id: string;
  title?: string;
  content: string | { html?: string; text?: string; images?: string[] };
  profileImage?: string;
  profileImageUrl?: string;
  tagIds?: number[];
}

export default function NeighborhoodNewspaperDetailPage() {
  const { id } = useParams();
  const [journal, setJournal] = useState<Newspaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [tags, setTags] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const fetchJournal = async () => {
      setLoading(true);
      setError(null);
      console.log('[DEBUG] useParams id:', id);
      try {
        const res = await ApiService.get(`/newspaper/${id}`);
        console.log('[DEBUG] API response:', res);
        setJournal(res.data);
      } catch (e) {
        setError("Erreur lors du chargement du journal.");
        console.log('[DEBUG] error in fetchJournal:', e);
      } finally {
        setLoading(false);
        console.log('[DEBUG] fetchJournal finished');
      }
    };
    if (id) fetchJournal();
    else console.log('[DEBUG] id is undefined in useParams');
  }, [id]);

  useEffect(() => {
    const fetchTags = async () => {
      const repo = new TagRepository();
      const tags = await repo.getTags();
      setTags(tags);
    };
    fetchTags();
  }, []);

  function renderContent(content: Newspaper['content']) {
    if (!content) return null;
    if (typeof content === 'string') return <div className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: content }} />;
    if (typeof content === 'object') {
      if ('html' in content && typeof content.html === 'string') {
        return <div className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: content.html }} />;
      }
      if ('text' in content && typeof content.text === 'string') {
        return <div className="whitespace-pre-line">{content.text}</div>;
      }
      return <pre className="text-xs text-gray-400 bg-gray-50 p-2 rounded">{JSON.stringify(content, null, 2)}</pre>;
    }
    return null;
  }

  function getTagName(tagIds?: number[]) {
    if (!tagIds || tagIds.length === 0) return null;
    const tag = tags.find(t => t.id === tagIds[0]);
    return tag ? tag.name : null;
  }

  return (
    <>
      <div>
        <DashboardHeader />
      </div>
      <div className="max-w-2xl mx-auto py-8">
        {loading ? (
          <div className="text-gray-400">Chargement...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : journal ? (
          <div className="border rounded p-6 flex flex-col items-center gap-4 bg-white mb-4">
            {journal.profileImageUrl || journal.profileImage ? (
              <img
                src={journal.profileImageUrl || journal.profileImage}
                alt="Profil"
                className="w-40 h-40 aspect-square object-cover "
                style={{ minWidth: 100, minHeight: 100, maxWidth: 600, maxHeight: 600 }}
              />
            ) : null}
            <h1 className="text-2xl font-bold mb-2">{journal.title}</h1>
            {getTagName(journal.tagIds) && (
              <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded mb-2">
                {getTagName(journal.tagIds)}
              </span>
            )}
            <div className="w-full mt-4">{renderContent(journal.content)}</div>
          </div>
        ) : (
          <div className="text-gray-500">Journal introuvable.</div>
        )}
        {(!loading && !error && journal) && (
          <Button
            variant="orange"
            className="w-full max-w-xs h-12 text-base font-bold bg-orange hover:bg-orange-hover text-white mx-auto"
            onClick={() => navigate(-1)}
          >
            &larr; Retour
          </Button>
        )}
      </div>
    </>
  );
} 