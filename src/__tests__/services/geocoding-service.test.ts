import { obtenirAdresseDepuisCoordonnees, rechercherAdresse } from '@/services/geocoding-service';

describe('geocoding-service', () => {
  const fetchOriginal = global.fetch;
  const fetchSimule = jest.fn();

  beforeEach(() => {
    fetchSimule.mockReset();
    global.fetch = fetchSimule as unknown as typeof fetch;
  });

  afterAll(() => {
    global.fetch = fetchOriginal;
  });

  it("n'interroge pas le service pour une recherche trop courte", async () => {
    await expect(rechercherAdresse(' ab ')).resolves.toEqual([]);
    expect(fetchSimule).not.toHaveBeenCalled();
  });

  it('convertit les résultats Nominatim', async () => {
    fetchSimule.mockResolvedValue({
      ok: true,
      json: async () => [{ lat: '48.8584', lon: '2.2945', display_name: 'Tour Eiffel, Paris' }],
    });

    const resultats = await rechercherAdresse('Tour Eiffel');

    expect(resultats).toEqual([{ latitude: 48.8584, longitude: 2.2945, libelle: 'Tour Eiffel, Paris' }]);
    expect(fetchSimule.mock.calls[0][0]).toContain('/search?q=Tour+Eiffel&format=json&limit=5');
  });

  it('lève une erreur si le service répond en erreur', async () => {
    fetchSimule.mockResolvedValue({ ok: false });
    await expect(rechercherAdresse('Tour Eiffel')).rejects.toThrow('Recherche impossible');
  });

  it("retrouve l'adresse correspondant à des coordonnées", async () => {
    fetchSimule.mockResolvedValue({ ok: true, json: async () => ({ display_name: '1 rue de Paris' }) });

    await expect(obtenirAdresseDepuisCoordonnees({ latitude: 48.8, longitude: 2.3 })).resolves.toBe('1 rue de Paris');
    expect(fetchSimule.mock.calls[0][0]).toContain('/reverse?lat=48.8&lon=2.3&format=json');
  });

  it('retourne une chaîne vide en cas de problème réseau', async () => {
    fetchSimule.mockRejectedValue(new Error('hors ligne'));
    await expect(obtenirAdresseDepuisCoordonnees({ latitude: 0, longitude: 0 })).resolves.toBe('');

    fetchSimule.mockResolvedValue({ ok: false });
    await expect(obtenirAdresseDepuisCoordonnees({ latitude: 0, longitude: 0 })).resolves.toBe('');
  });
});
