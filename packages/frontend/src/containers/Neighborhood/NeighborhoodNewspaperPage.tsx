import { useEffect, useState } from "react";
import NewspaperEditor from "@/components/Neighborhood/NewspaperEditor";
import { withHeaderData } from '@/containers/Wrapper/Wrapper';
import { NeighborhoodFrontRepository } from '@/infrastructure/repositories/NeighborhoodFrontRepository';
import ApiService from '@/infrastructure/api/ApiService';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '@/components/Header/DashboardHeader.tsx';
import { Button } from '@/components/ui/button';
import { TagRepository } from '@/infrastructure/repositories/TagRepository';
import { TagModel } from '@/domain/models/tag.model';
import type { UserModel } from '@/domain/models/user.model';
import type { HomeUc } from '@/domain/use-cases/homeUc';
import MultiSelectTagComponent from '@/components/SelectComponent/MultiSelectTagComponent';

interface Newspaper {
  id: string;
  title?: string;
  content: string | { text?: string; images?: string[] };
  profileImageUrl?: string;
  tagIds?: number[];
}

interface NeighborhoodNewspaperPageProps {
  user: UserModel;
  neighborhoodId: string;
  uc: HomeUc;
}

function NeighborhoodNewspaperPage({ user, neighborhoodId, uc }: NeighborhoodNewspaperPageProps) {
  const [newspapers, setNewspapers] = useState<Newspaper[]>([]);
  const [canCreate, setCanCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<TagModel[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTitle, setSearchTitle] = useState('');
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
          id: j.id || j._id || j.journalId
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

  // Fonction utilitaire pour extraire le texte brut du contenu html
  function getExcerpt(content: Newspaper['content'], maxLength = 180) {
    let html = '';
    if (typeof content === 'string') html = content;
    else if (content && typeof content === 'object' && 'html' in content && typeof content.html === 'string') html = content.html;
    else if (content && typeof content === 'object' && 'text' in content && typeof content.text === 'string') html = content.text;
    // Remplace les <br> et <br/> par des retours à la ligne
    html = html.replace(/<br\s*\/?>/gi, '\n');
    // Supprime les autres balises HTML
    let text = html.replace(/<[^>]+>/g, '');
    // Découpe sur les vrais retours à la ligne (\n, \r\n, \r)
    const lines = text.split(/\r?\n|\r/).map(l => l.trim()).filter(Boolean);
    const firstLine = lines[0] || '';
    return firstLine.length > maxLength ? firstLine.slice(0, maxLength) + '…' : firstLine;
  }

  return (
    <>
      <DashboardHeader />
      <div className="max-w-2xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6 gap-2">
          <h1 className="text-2xl font-bold">Journaux du quartier</h1>
          {canCreate && (
            <Button
              variant="orange"
              className="h-9 px-4 text-sm font-bold bg-orange hover:bg-orange-hover text-white"
              onClick={() => navigate("/neighborhood/newspaper/create")}
            >
              Créer un journal
            </Button>
          )}
        </div>
        {/* Barre de recherche et filtre multi-sélection par tag alignés */}
        <div className="mb-4 flex flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Rechercher par titre..."
            value={searchTitle}
            onChange={e => setSearchTitle(e.target.value)}
            className="border rounded px-2 py-1 w-full max-w-xs"
          />
          <MultiSelectTagComponent tags={tags} onSelect={setSelectedTags} />
        </div>
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
              .slice() 
              .reverse()
              .filter(np => np.id)
              .filter(np => {
                if (!searchTitle.trim()) return true;
                return (np.title || '').toLowerCase().includes(searchTitle.trim().toLowerCase());
              })
              .filter(np => {
                if (!selectedTags.length) return true;
                // On récupère le nom du tag du journal
                const tagName = getTagName(np.tagIds);
                return tagName && selectedTags.includes(tagName);
              })
              .map((np, idx) => (
                <div
                  key={np.id || idx}
                  className="border rounded-2xl p-0 flex gap-0 items-stretch cursor-pointer hover:bg-gray-50 transition bg-white mb-6 shadow-lg overflow-hidden min-h-[240px] relative"
                  style={{ minHeight: 240, height: 'auto' }}
                  onClick={() => navigate(`/neighborhood/newspaper/${np.id}`)}
                >
                  <div className="flex-shrink-0 w-[320px] h-auto relative">
                    {np.profileImageUrl ? (
                      <img
                        src={np.profileImageUrl}
                        alt="Profil"
                        className="object-cover absolute left-0 top-0 h-full w-full"
                        style={{ minHeight: '100%', height: '100%', width: '100%', maxHeight: 'none' }}
                      />
                    ) : (
                      <div className="flex items-center justify-center absolute left-0 top-0 h-full w-full bg-gray-200">
                        <span className="material-symbols-outlined text-6xl text-gray-400 select-none">no_photography</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center p-8 z-10">
                    <h3 className="font-bold text-2xl mb-2 truncate">{np.title}</h3>
                    {getTagName(np.tagIds) && (
                      <div className="flex flex-row items-center mb-2">
                        <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded mr-2 max-w-xs truncate">
                          {getTagName(np.tagIds)}
                        </span>
                      </div>
                    )}
                    <div className="text-gray-600 text-base mt-2 truncate" style={{ maxWidth: '100%' }}>
                      {getExcerpt(np.content)}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </>
  );
}

export default withHeaderData(NeighborhoodNewspaperPage); 