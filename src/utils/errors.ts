const messagesFirebase: Record<string, string> = {
  'auth/invalid-email': "L'adresse email n'est pas valide.",
  'auth/user-disabled': 'Ce compte a été désactivé.',
  'auth/user-not-found': 'Email ou mot de passe incorrect.',
  'auth/wrong-password': 'Email ou mot de passe incorrect.',
  'auth/invalid-credential': 'Email ou mot de passe incorrect.',
  'auth/email-already-in-use': 'Un compte existe déjà avec cet email.',
  'auth/weak-password': 'Le mot de passe est trop faible (6 caractères minimum).',
  'auth/too-many-requests': 'Trop de tentatives. Réessayez dans quelques minutes.',
  'auth/network-request-failed': 'Problème de connexion réseau.',
  'auth/invalid-api-key': 'Configuration Firebase invalide : vérifiez la clé API dans le fichier .env.',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
    'Configuration Firebase invalide : vérifiez la clé API dans le fichier .env.',
  'auth/configuration-not-found':
    "La connexion par email n'est pas activée dans Firebase Authentication (voir README).",
  'auth/operation-not-allowed':
    "La connexion par email n'est pas activée dans Firebase Authentication (voir README).",
  'permission-denied': "Vous n'avez pas les droits pour effectuer cette action.",
  'storage/unauthorized': "Vous n'avez pas les droits pour envoyer cette image.",
  'storage/quota-exceeded': 'Le quota de stockage est dépassé.',
  unavailable: 'Le service est momentanément indisponible.',
};

export const traduireErreur = (erreur: unknown): string => {
  if (erreur && typeof erreur === 'object' && 'code' in erreur) {
    const code = String((erreur as { code: unknown }).code);
    if (messagesFirebase[code]) {
      return messagesFirebase[code];
    }
  }
  return 'Une erreur inattendue est survenue. Veuillez réessayer.';
};
