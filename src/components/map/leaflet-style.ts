const identifiantFeuilleStyle = 'feuille-style-leaflet';

export const chargerStyleLeaflet = (): void => {
  if (typeof document === 'undefined' || document.getElementById(identifiantFeuilleStyle)) {
    return;
  }
  const lien = document.createElement('link');
  lien.id = identifiantFeuilleStyle;
  lien.rel = 'stylesheet';
  lien.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  lien.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
  lien.crossOrigin = '';
  document.head.appendChild(lien);
};
