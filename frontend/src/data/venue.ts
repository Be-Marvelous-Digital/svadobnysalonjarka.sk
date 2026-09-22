/**
 * Copy for the wedding venue page and for the band that teases it on the home
 * page. Deliberately free of numbers the salon has not confirmed — capacity, a
 * price and the catering arrangement belong here once they are known, and each
 * one is worth more than any sentence below.
 */
export const VENUE = {
    name: 'K-centrum',
    place: 'Topoľnica',
    district: 'okres Galanta',
} as const;

export const VENUE_HERO = {
    kicker: `Svadobný priestor · ${VENUE.place}`,
    title: 'Miesto, kde sa tie šaty konečne ukážu',
    lead: 'Šaty u nás vyberiete, termín skúšky dohodnete po telefóne. A keď chcete, dohodnete aj sálu: K-centrum v Topoľnici je náš svadobný priestor, takže celý deň má jedného človeka, ktorému zavoláte.',
} as const;

export interface VenueUsp {
    title: string;
    body: string;
}

export const VENUE_USPS: VenueUsp[] = [
    {
        title: 'Šaty aj sála na jednom mieste',
        body: 'Namiesto piatich telefonátov a troch obhliadok jedna návšteva. Pri skúške šiat sa rovno pozriete na sálu a dohodnete termín.',
    },
    {
        title: 'V deň svadby patrí priestor vám',
        body: 'Žiadna druhá oslava vo vedľajšej miestnosti, žiadne delenie sa o parkovisko. K-centrum je v ten deň vaše.',
    },
    {
        title: 'Pohostinstvo priamo v dome',
        body: 'K-centrum je pohostinstvo, takže kuchyňa aj obsluha sú na mieste. Nemusíte zháňať catering ani riešiť, kde sa bude variť.',
    },
    {
        title: 'Dedina namiesto hotelovej sály',
        body: `Topoľnica, ${VENUE.district}. Pokoj, miesto na parkovanie a fotky vonku bez toho, aby vám do nich vošla recepcia.`,
    },
];

export interface VenueStorySection {
    heading: string;
    paragraphs: string[];
}

export const VENUE_STORY: VenueStorySection[] = [
    {
        heading: 'Priestor, ktorý si nevymýšľa',
        paragraphs: [
            'K-centrum nie je sála, ktorá sa tvári ako niečo iné. Je to poctivý priestor v Topoľnici, kde sa oslavuje odjakživa: krstiny, výročia, stužkové aj svadby. Má to, čo svadba naozaj potrebuje — miesto na stoly, miesto na tanec a kuchyňu, ktorá to zvládne.',
            'Práve preto sa dá zariadiť podľa vás. Bielo a jemne, alebo sýto a farebne. Priestor sa nebráni ani jednému, lebo sám nekričí.',
        ],
    },
    {
        heading: 'Prečo to robíme',
        paragraphs: [
            'Devätnásť rokov obliekame nevesty a devätnásť rokov počúvame to isté: najviac síl neberie výber šiat, ale zháňanie všetkého ostatného. Sála tu, jedlo tam, každý s iným termínom a iným telefónom.',
            'Sála k salónu je odpoveď na to. Keď si u nás vyberiete šaty, máte kde ich ukázať — a jedného človeka, s ktorým sa dohodnete na oboje.',
        ],
    },
];

/** Shown on the home page, above the button through to the page itself. */
export const VENUE_TEASER = {
    kicker: 'Svadobný priestor',
    title: 'Aj sálu máme',
    body: `Okrem šiat ponúkame aj miesto, kde sa svadba odohrá. ${VENUE.name} v Topoľnici je náš svadobný priestor — pohostinstvo s kuchyňou na mieste, v deň svadby len pre vás.`,
    cta: 'Pozrieť priestor',
} as const;
