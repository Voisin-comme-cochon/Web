import fetch from 'node-fetch';

const baseurl = 'http://localhost:3000';

const rawTags = `
2,Films,#000000
3,Animaux,#A9FF12
4,Football,#22c55e
5,Basketball,#16a34a
6,Tennis,#15803d
7,Course à pied,#166534
8,Yoga,#14532d
9,Natation,#10b981
10,Cyclisme,#059669
11,Randonnée,#047857
12,Fitness,#065f46
13,Arts martiaux,#064e3b
14,Danse,#34d399
15,Escalade,#6ee7b7
16,Pétanque,#86efac
17,Volleyball,#bbf7d0
18,Badminton,#d1fae5
19,Peinture,#a855f7
20,Sculpture,#9333ea
21,Photographie,#7c3aed
22,Théâtre,#6d28d9
23,Cinéma,#5b21b6
24,Musique,#4c1d95
25,Littérature,#c084fc
26,Poésie,#d8b4fe
27,Chant,#e9d5ff
28,Dessin,#f3e8ff
29,Art numérique,#8b5cf6
30,Artisanat,#a78bfa
31,Poterie,#c4b5fd
32,Calligraphie,#ddd6fe
33,Cuisine française,#f97316
34,Cuisine végétarienne,#ea580c
35,Cuisine du monde,#dc2626
36,Pâtisserie,#fb923c
37,Œnologie,#c2410c
38,Boulangerie,#fdba74
39,Cuisine bio,#fed7aa
40,Barbecue,#ffedd5
41,Cuisine asiatique,#f59e0b
42,Cuisine italienne,#d97706
43,Apéritifs,#fbbf24
44,Brunch,#fcd34d
45,Jardinage,#3b82f6
46,Bricolage,#2563eb
47,Jeux de société,#1d4ed8
48,Jeux vidéo,#1e40af
49,Lecture,#60a5fa
50,Voyages,#93c5fd
51,Camping,#bfdbfe
52,Pêche,#dbeafe
53,Observation des oiseaux,#eff6ff
54,Astronomie,#172554
55,Collection,#1e3a8a
56,Modélisme,#2563eb
57,Échecs,#3730a3
58,Poker,#4338ca
59,Méditation,#ec4899
60,Relaxation,#db2777
61,Développement personnel,#be185d
62,Sophrologie,#9f1239
63,Massage,#f472b6
64,Aromathérapie,#f9a8d4
65,Naturopathie,#fbcfe8
66,Reiki,#fce7f3
67,Tai-chi,#fdf2f8
68,Qi gong,#e11d48
69,Pilates,#f43f5e
70,Langues étrangères,#eab308
71,Informatique,#ca8a04
72,Histoire,#a16207
73,Sciences,#854d0e
74,Mathématiques,#facc15
75,Philosophie,#fde047
76,Économie,#fef08a
77,Droit,#fef3c7
78,Psychologie,#fffbeb
79,Soutien scolaire,#fbbf24
80,Formation professionnelle,#f59e0b
81,Ateliers créatifs,#d97706
82,Écologie,#059669
83,Recyclage,#047857
84,Compostage,#065f46
85,Énergie renouvelable,#064e3b
86,Permaculture,#10b981
87,Zéro déchet,#34d399
88,Protection animale,#6ee7b7
89,Biodiversité,#86efac
90,Agriculture urbaine,#0d9488
91,Apiculture,#0f766e
92,Bénévolat,#ef4444
93,Aide aux personnes âgées,#dc2626
94,Soutien aux familles,#b91c1c
95,Intégration,#991b1b
96,Solidarité,#f87171
97,Don du sang,#fca5a5
98,Maraudes,#fecaca
99,Alphabétisation,#fee2e2
100,Aide aux devoirs,#fef2f2
101,Écoute,#e11d48
102,Mentorat,#be123c
103,Inclusion,#9f1239
104,Activités parent-enfant,#06b6d4
105,Garde partagée,#0891b2
106,Sortie en famille,#0e7490
107,Éveil musical,#155e75
108,Ateliers enfants,#22d3ee
109,Ludothèque,#67e8f9
110,Contes,#a5f3fc
111,Baby-sitting,#cffafe
112,Groupes de parole parents,#ecfeff
113,Anniversaires,#08979c
114,Programmation,#475569
115,Intelligence artificielle,#334155
116,Robotique,#1e293b
117,Impression 3D,#0f172a
118,Réalité virtuelle,#64748b
119,Blockchain,#94a3b8
120,Cybersécurité,#cbd5e1
121,Domotique,#e2e8f0
122,FabLab,#f1f5f9
123,Chiens,#92400e
124,Chats,#78350f
125,Oiseaux,#451a03
126,Aquariophilie,#a16207
127,Éducation canine,#d97706
128,Toilettage,#f59e0b
129,Promenade collective,#fbbf24
130,Adoption animale,#fcd34d
131,Covoiturage,#0d9488
132,Vélo partagé,#0f766e
133,Marche collective,#115e59
134,Transport solidaire,#134e4a
135,Autopartage,#14b8a6
136,Mobilité douce,#2dd4bf
137,Sécurité routière,#5eead4
138,Couture,#ec4899
139,Tricot,#db2777
140,Mode éthique,#be185d
141,Relooking,#9f1239
142,Customisation,#f472b6
143,Troc vêtements,#f9a8d4
144,Mercerie,#fbcfe8
1,Jeu de société,#14532d
`;

const tags = rawTags
    .trim()
    .split('\n')
    .map((line) => {
        const [, name, color] = line.split(',');
        return { name, color };
    });

for (const tag of tags) {
    try {
        const response = await fetch(`${baseurl}/tags`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tag),
        });

        if (!response.ok) {
            console.error(`❌ Échec pour ${tag.name}: ${response.statusText}`);
        } else {
            console.log(`✅ Tag inséré : ${tag.name}`);
        }
    } catch (err) {
        console.error(`❌ Erreur réseau pour ${tag.name}:`, err.message);
    }
}
