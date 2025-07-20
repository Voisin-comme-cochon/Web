import { useEffect, useState } from "react";
import NewspaperEditor from "@/components/Neighborhood/NewspaperEditor";
import { useHeaderData } from '@/presentation/hooks/UseHeaderData';
import { NeighborhoodFrontRepository } from '@/infrastructure/repositories/NeighborhoodFrontRepository';
import ApiService from '@/infrastructure/api/ApiService';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '@/components/Header/DashboardHeader.tsx';
import { TagRepository } from '@/infrastructure/repositories/TagRepository';
import { TagModel } from '@/domain/models/tag.model';

interface Newspaper {
  id: string;
  title?: string;
  content: string | { text?: string; images?: string[] };
  profileImageUrl?: string;
  tagIds?: number[];
}

export default function NeighborhoodNewspaperPage() {
  const { user } = useHeaderData();
  const neighborhoodId = localStorage.getItem('neighborhoodId');
  const [newspapers, setNewspapers] = useState<Newspaper[]>([]);
  const [canCreate, setCanCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<TagModel[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTags = async () => {
      const repo = new TagRepository();
      const tags = await repo.getTags();
      setTags(tags);
    };
    fetchTags();
  }, []);

  useEffect(() => {
    const checkRole = async () => {
      if (!user || !neighborhoodId) return;
      const repo = new NeighborhoodFrontRepository();
      try {
        const members = await repo.getMembersByNeighborhoodId(neighborhoodId);
        const me = members.find((m: { id: number; neighborhoodRole: string }) => m.id === user.id);
        const isJournalist = me?.neighborhoodRole === 'journalist' || me?.neighborhoodRole === 'admin';
        setCanCreate(isJournalist);
      } catch (e) {
        setCanCreate(false);
      }
    };
    checkRole();
  }, [user, neighborhoodId]);

  useEffect(() => {
    const fetchNewspapers = async () => {
      console.log('[DEBUG] fetchNewspapers called, neighborhoodId:', neighborhoodId);
      if (!neighborhoodId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await ApiService.get(`/newspaper?neighborhoodId=${neighborhoodId}`);
        console.log('[DEBUG:NEWSPAPER_RAW]', res.data);
        setNewspapers((res.data || []).map((j: any) => ({
          ...j,
          id: j.id || j._id || j.journalId // adapte ici selon la vraie clé
        })));
      } catch (e) {
        setError("Erreur lors du chargement des journaux.");
        setNewspapers([]);
        console.log('[DEBUG] error in fetchNewspapers:', e);
      } finally {
        setLoading(false);
        console.log('[DEBUG] fetchNewspapers finished');
      }
    };
    fetchNewspapers();
  }, [neighborhoodId]);

  const handleCreate = async (data: { title: string; content: string }) => {
    if (!neighborhoodId) return;
    setError(null);
    try {
      await ApiService.post(`/newspaper`, {
        ...data,
        neighborhoodId,
      });
      const res = await ApiService.get(`/newspaper?neighborhoodId=${neighborhoodId}`);
      setNewspapers(res.data || []);
    } catch (e) {
      setError("Erreur lors de la création du journal.");
    }
  };

  function renderContent(content: Newspaper['content']) {
    if (typeof content === 'string') return <div className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: content }} />;
    if (content && typeof content === 'object') {
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
        <h1 className="text-2xl font-bold mb-4">Journaux du quartier</h1>
        <h2 className="text-xl font-semibold mt-8 mb-2">Historique</h2>
        <div className="space-y-6">
          {(() => { console.log('[DEBUG:NEWSPAPER_IDS] ids des journaux listés:', newspapers.map(np => np.id)); return null; })()}
          {loading ? (
            <div className="text-gray-400">Chargement...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : newspapers.length === 0 ? (
            <div className="text-gray-500">Aucun journal pour ce quartier.</div>
          ) : (
            newspapers
              .filter(np => np.id)
              .map((np, idx) => (
                <div
                  key={np.id || idx}
                  className="border rounded p-4 flex gap-4 items-start cursor-pointer hover:bg-gray-50 transition bg-white"
                  onClick={() => navigate(`/neighborhood/newspaper/${np.id}`)}
                >
                  {np.profileImageUrl && (
                    <img
                      src={np.profileImageUrl}
                      alt="Profil"
                      className="w-16 h-16 object-cover rounded-full border"
                      style={{ minWidth: 64, minHeight: 64 }}
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold mb-2">{np.title}</h3>
                    {getTagName(np.tagIds) && (
                      <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded mb-2 mr-2">
                        {getTagName(np.tagIds)}
                      </span>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
        {canCreate && (
          <div className="flex justify-center mt-8">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => navigate("/neighborhood/newspaper/create")}
            >
              Créer un journal
            </button>
          </div>
        )}
      </div>
    </>
  );
} 