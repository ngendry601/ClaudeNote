// Sources de veille par défaut (partagées avec scripts/veille.mjs, sans dépendance au navigateur)
export const DEFAULT_SOURCES = [
  { id: 'hn', name: 'Hacker News', type: 'hn', enabled: true, color: '#ff6600' },
  { id: 'devto', name: 'DEV Community', type: 'devto', enabled: true, color: '#3b49df' },
  { id: 'korben', name: 'Korben', type: 'rss', url: 'https://korben.info/feed', enabled: true, color: '#e11d48' },
  { id: 'next', name: 'Next', type: 'rss', url: 'https://next.ink/feed/', enabled: true, color: '#0ea5e9' },
  { id: 'certfr', name: 'CERT-FR (alertes sécu)', type: 'rss', url: 'https://cert.cyber.gouv.fr/feed/', enabled: true, color: '#dc2626' },
  { id: 'lmi', name: 'Le Monde Informatique', type: 'rss', url: 'https://www.lemondeinformatique.fr/rss.xml', enabled: false, color: '#16a34a' },
  { id: 'numerama', name: 'Numerama', type: 'rss', url: 'https://www.numerama.com/feed/', enabled: false, color: '#9333ea' },
  { id: 'zdnet', name: 'ZDNet France', type: 'rss', url: 'https://www.zdnet.fr/feeds/rss/actualites/', enabled: false, color: '#ca8a04' },
  { id: 'lobsters', name: 'Lobsters', type: 'rss', url: 'https://lobste.rs/rss', enabled: false, color: '#ac130d' },
];
