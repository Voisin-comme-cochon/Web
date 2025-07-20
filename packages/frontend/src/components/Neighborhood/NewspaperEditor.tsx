import { useState, useEffect } from "react";
import Editor from "react-simple-wysiwyg";
import ApiService from '@/infrastructure/api/ApiService';
import { useHeaderData } from '@/presentation/hooks/UseHeaderData';
import ComboboxComponentTag from '@/components/ComboboxComponent/ComboboxComponentTag';
import { TagRepository } from '@/infrastructure/repositories/TagRepository';
import { TagModel } from '@/domain/models/tag.model';
import { Button } from '@/components/ui/button';

interface Props {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
  loading?: boolean;
  setLoading?: (b: boolean) => void;
  profileImage?: string | null;
  profileImageFile?: File | null;
  neighborhoodId?: string | null;
  onCancel?: () => void;
}

export default function NewspaperEditor({
  onSuccess,
  onError,
  loading,
  setLoading,
  profileImage,
  profileImageFile,
  neighborhoodId,
  onCancel
}: Props) {
  const { user } = useHeaderData();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagId, setTagId] = useState<number | null>(null);
  const [tags, setTags] = useState<TagModel[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      const repo = new TagRepository();
      const tags = await repo.getTags();
      setTags(tags);
    };
    fetchTags();
  }, []);

  const handleSetTag = (selectedTag: number | null) => {
    setTagId(selectedTag);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!neighborhoodId || !user?.id) return;
    onError?.("");
    setLoading?.(true);
    try {
      const formData = new FormData();
      formData.append('userId', String(user.id));
      formData.append('neighborhoodId', String(neighborhoodId));
      formData.append('content', JSON.stringify({ html: content }));
      if (profileImageFile) formData.append('profileImage', profileImageFile);
      if (title) formData.append('title', title);
      if (tagId) formData.append('tagId', String(tagId));
      await ApiService.post(`/newspaper`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTitle("");
      setContent("");
      setTagId(null);
      onSuccess?.();
    } catch (e) {
      onError?.("Erreur lors de la création du journal.");
    } finally {
      setLoading?.(false);
    }
  }

  function handleContentChange(e: any) {
    setContent(e.target.value);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded bg-white space-y-4 max-w-3xl mx-auto">
      {profileImage && (
        <img src={profileImage} alt="Aperçu" className="w-24 h-24 object-cover rounded-full border mx-auto mb-2" />
      )}
      <input
        className="w-full mb-2 p-2 border rounded"
        placeholder="Titre du journal"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
        disabled={loading}
      />
      <div className="mb-2">
        <ComboboxComponentTag
          tags={tags}
          value={tagId}
          handleSetTag={handleSetTag}
        />
      </div>
      <div style={{ minHeight: 180 }}>
        <Editor value={content} onChange={handleContentChange} style={{ minHeight: 300 }} />
      </div>
      <div className="flex flex-row gap-4 mt-4">
        <Button
          type="button"
          variant="ghost"
          className="h-12 w-1/2 text-base font-bold bg-gray-200 hover:bg-gray-300 text-gray-700"
          onClick={() => (typeof onCancel === 'function' ? onCancel() : window.history.back())}
          disabled={loading}
        >
          Retour
        </Button>
        <Button
          type="submit"
          variant="orange"
          className="h-12 w-1/2 text-base font-bold bg-orange hover:bg-orange-hover text-white"
          disabled={loading}
        >
          Publier
        </Button>
      </div>
    </form>
  );
} 