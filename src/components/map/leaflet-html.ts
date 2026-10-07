import { couleurs } from '@/constants/theme';
import type { Coordonnees } from '@/types/models';

import type { MarqueurCarte } from './types';

export type EtatCarteLeaflet = {
  position: Coordonnees | null;
  marqueurs: MarqueurCarte[];
  emplacement: Coordonnees | null;
};

export type MessageCarte =
  | { type: 'pret' }
  | { type: 'selection'; id: string }
  | { type: 'clic'; latitude: number; longitude: number };

export type OptionsCarteLeaflet = {
  centre: Coordonnees;
  zoom: number;
  selectionnable: boolean;
};

export const urlTuilesOsm = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

const versionLeaflet = '1.9.4';
const empreinteCss = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
const empreinteJs = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';

const estCoordonneeValide = (valeur: unknown, limite: number): valeur is number =>
  typeof valeur === 'number' && Number.isFinite(valeur) && Math.abs(valeur) <= limite;

export const analyserMessageCarte = (donnees: string): MessageCarte | null => {
  try {
    const message = JSON.parse(donnees) as Record<string, unknown>;
    if (message.type === 'pret') {
      return { type: 'pret' };
    }
    if (message.type === 'selection' && typeof message.id === 'string' && message.id) {
      return { type: 'selection', id: message.id };
    }
    if (
      message.type === 'clic' &&
      estCoordonneeValide(message.latitude, 90) &&
      estCoordonneeValide(message.longitude, 180)
    ) {
      return { type: 'clic', latitude: message.latitude, longitude: message.longitude };
    }
    return null;
  } catch {
    return null;
  }
};

export const construireScriptMiseAJour = (etat: EtatCarteLeaflet): string =>
  `window.mettreAJourCarte && window.mettreAJourCarte(${JSON.stringify(etat)});true;`;

export const construireScriptRecentrage = (centre: Coordonnees, zoom: number): string =>
  `window.recentrerCarte && window.recentrerCarte(${JSON.stringify({ ...centre, zoom })});true;`;

export const genererHtmlCarte = ({ centre, zoom, selectionnable }: OptionsCarteLeaflet): string => `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@${versionLeaflet}/dist/leaflet.css" integrity="${empreinteCss}" crossorigin="" />
<script src="https://unpkg.com/leaflet@${versionLeaflet}/dist/leaflet.js" integrity="${empreinteJs}" crossorigin=""></script>
<style>
html, body, #carte { height: 100%; width: 100%; margin: 0; padding: 0; background: ${couleurs.fond}; }
.popup-titre { font-weight: 700; font-size: 15px; }
.popup-description { margin-top: 4px; color: ${couleurs.texteSecondaire}; }
.popup-bouton { margin-top: 8px; padding: 8px 12px; border: none; border-radius: 6px; background: ${couleurs.primaire}; color: ${couleurs.blanc}; font-weight: 600; font-size: 14px; }
</style>
</head>
<body>
<div id="carte"></div>
<script>
(function () {
  var envoyer = function (message) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }
  };
  var carte = L.map('carte', { zoomControl: false, attributionControl: true }).setView([${centre.latitude}, ${centre.longitude}], ${zoom});
  L.control.zoom({ position: 'topright' }).addTo(carte);
  L.tileLayer('${urlTuilesOsm}', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(carte);
  var calqueMarqueurs = L.layerGroup().addTo(carte);
  var marqueurPosition = null;
  var marqueurEmplacement = null;
  var creerPopup = function (marqueur) {
    var conteneur = document.createElement('div');
    var titre = document.createElement('div');
    titre.className = 'popup-titre';
    titre.textContent = marqueur.titre;
    conteneur.appendChild(titre);
    if (marqueur.description) {
      var description = document.createElement('div');
      description.className = 'popup-description';
      description.textContent = marqueur.description;
      conteneur.appendChild(description);
    }
    var bouton = document.createElement('button');
    bouton.className = 'popup-bouton';
    bouton.type = 'button';
    bouton.textContent = 'Voir le détail';
    bouton.addEventListener('click', function () {
      envoyer({ type: 'selection', id: marqueur.id });
    });
    conteneur.appendChild(bouton);
    return conteneur;
  };
  window.mettreAJourCarte = function (etat) {
    calqueMarqueurs.clearLayers();
    (etat.marqueurs || []).forEach(function (marqueur) {
      L.circleMarker([marqueur.latitude, marqueur.longitude], {
        radius: 11,
        color: '${couleurs.blanc}',
        weight: 2,
        fillColor: marqueur.estPersonnel ? '${couleurs.marqueurPerso}' : '${couleurs.marqueurPublic}',
        fillOpacity: 0.95
      }).bindPopup(creerPopup(marqueur)).addTo(calqueMarqueurs);
    });
    if (marqueurPosition) {
      carte.removeLayer(marqueurPosition);
      marqueurPosition = null;
    }
    if (etat.position) {
      marqueurPosition = L.circleMarker([etat.position.latitude, etat.position.longitude], {
        radius: 8,
        color: '${couleurs.blanc}',
        weight: 3,
        fillColor: '#2F80ED',
        fillOpacity: 1
      }).addTo(carte);
    }
    if (marqueurEmplacement) {
      carte.removeLayer(marqueurEmplacement);
      marqueurEmplacement = null;
    }
    if (etat.emplacement) {
      marqueurEmplacement = L.marker([etat.emplacement.latitude, etat.emplacement.longitude]).addTo(carte);
    }
  };
  window.recentrerCarte = function (cible) {
    carte.setView([cible.latitude, cible.longitude], cible.zoom);
  };
  if (${selectionnable}) {
    carte.on('click', function (evenement) {
      envoyer({ type: 'clic', latitude: evenement.latlng.lat, longitude: evenement.latlng.lng });
    });
  }
  envoyer({ type: 'pret' });
})();
</script>
</body>
</html>`;
