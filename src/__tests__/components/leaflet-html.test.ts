import {
  analyserMessageCarte,
  construireScriptMiseAJour,
  construireScriptRecentrage,
  genererHtmlCarte,
} from '@/components/map/leaflet-html';

describe('leaflet-html', () => {
  describe('analyserMessageCarte', () => {
    it('reconnaît les messages valides', () => {
      expect(analyserMessageCarte('{"type":"pret"}')).toEqual({ type: 'pret' });
      expect(analyserMessageCarte('{"type":"selection","id":"abc"}')).toEqual({ type: 'selection', id: 'abc' });
      expect(analyserMessageCarte('{"type":"clic","latitude":45.7,"longitude":4.8}')).toEqual({
        type: 'clic',
        latitude: 45.7,
        longitude: 4.8,
      });
    });

    it.each([
      'pas du json',
      '{"type":"inconnu"}',
      '{"type":"selection","id":""}',
      '{"type":"selection","id":42}',
      '{"type":"clic","latitude":"45","longitude":4}',
      '{"type":"clic","latitude":95,"longitude":4}',
      '{"type":"clic","latitude":45,"longitude":181}',
    ])('rejette %s', (donnees) => {
      expect(analyserMessageCarte(donnees)).toBeNull();
    });
  });

  it("sérialise l'état de la carte en JSON", () => {
    const script = construireScriptMiseAJour({
      position: { latitude: 1, longitude: 2 },
      emplacement: null,
      marqueurs: [
        { id: 'a', titre: '</script><img src=x onerror=alert(1)>', description: '', latitude: 3, longitude: 4, estPersonnel: true },
      ],
    });

    expect(script.startsWith('window.mettreAJourCarte && window.mettreAJourCarte(')).toBe(true);
    expect(script.endsWith(');true;')).toBe(true);
    const etat = JSON.parse(script.match(/mettreAJourCarte\((.*)\);true;$/)![1]);
    expect(etat.marqueurs[0].titre).toBe('</script><img src=x onerror=alert(1)>');
  });

  it('construit le script de recentrage', () => {
    expect(construireScriptRecentrage({ latitude: 1, longitude: 2 }, 13)).toBe(
      'window.recentrerCarte && window.recentrerCarte({"latitude":1,"longitude":2,"zoom":13});true;',
    );
  });

  it('génère une page Leaflet OpenStreetMap centrée et sécurisée', () => {
    const html = genererHtmlCarte({ centre: { latitude: 48.85, longitude: 2.35 }, zoom: 13, selectionnable: false });

    expect(html).toContain('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
    expect(html).toContain('integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="');
    expect(html).toContain('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    expect(html).toContain('setView([48.85, 2.35], 13)');
    expect(html).toContain('textContent = marqueur.titre');
    expect(html).not.toContain('innerHTML');
    expect(html).toContain('if (false)');
  });

  it('active la sélection au clic pour le choix d’emplacement', () => {
    const html = genererHtmlCarte({ centre: { latitude: 0, longitude: 0 }, zoom: 16, selectionnable: true });
    expect(html).toContain('if (true)');
  });
});
