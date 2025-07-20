import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NewspaperEditor from "@/components/Neighborhood/NewspaperEditor";
import { useHeaderData } from '@/presentation/hooks/UseHeaderData';
import DashboardHeader from '@/components/Header/DashboardHeader.tsx';

export default function NeighborhoodNewspaperCreatePage() {
  const { neighborhoodId } = useHeaderData();
  const [profileImage, setProfileImage] = useState<string | null>(null); // dataURL pour l'aperçu
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null); // fichier pour l'upload
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file); // stocke le fichier pour l'upload
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string); // dataURL pour l'aperçu
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <>
      <div>
        <DashboardHeader/>
      </div>
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Créer un journal</h1>
        <form className="mb-8 p-4 border rounded bg-white space-y-4" onSubmit={e => e.preventDefault()}>
          <label className="block mb-2 font-semibold">Image de profil</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </form>
        <NewspaperEditor
          profileImage={profileImage}
          profileImageFile={profileImageFile} // nouvelle prop
          neighborhoodId={neighborhoodId}
          onSuccess={() => navigate("/neighborhood-newspaper")}
          onError={setError}
          loading={loading}
          setLoading={setLoading}
        />
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {loading && <div className="text-gray-400 mt-2">Envoi en cours...</div>}
        <button
          className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          onClick={() => navigate("/neighborhood-newspaper")}
        >
          Retour
        </button>
      </div>
    </>
  );
} 