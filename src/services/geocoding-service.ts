import type { Coordonnees, ResultatGeocodage } from '@/types/models';

const urlNominatim = 'https://nominatim.openstreetmap.org';

const entetes = {
  Accept: 'application/json',
  'Accept-Language': 'fr',
  'User-Agent': 'MesBonnesAdresses/1.0',
};

type ReponseRecherche = { lat: string; lon: string; display_name: string }[];

type ReponseInverse = { display_name?: string };

export const rechercherAdresse = async (texte: string): Promise<ResultatGeocodage[]> => {
  const recherche = texte.trim();
  if (recherche.length < 3) {
    return [];
  }
  const parametres = new URLSearchParams({ q: recherche, format: 'json', limit: '5' });
  const reponse = await fetch(`${urlNominatim}/search?${parametres.toString()}`, { headers: entetes });
  if (!reponse.ok) {
    throw new Error('Recherche impossible');
  }
  const resultats = (await reponse.json()) as ReponseRecherche;
  return resultats.map((resultat) => ({
    latitude: Number(resultat.lat),
    longitude: Number(resultat.lon),
    libelle: resultat.display_name,
  }));
};

export const obtenirAdresseDepuisCoordonnees = async ({ latitude, longitude }: Coordonnees): Promise<string> => {
  try {
    const parametres = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      format: 'json',
    });
    const reponse = await fetch(`${urlNominatim}/reverse?${parametres.toString()}`, { headers: entetes });
    if (!reponse.ok) {
      return '';
    }
    const resultat = (await reponse.json()) as ReponseInverse;
    return resultat.display_name ?? '';
  } catch {
    return '';
  }
};
