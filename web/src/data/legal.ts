import { CONTACT } from './contact';

/** Shown on both legal pages so a reader always knows when the text last changed. */
export const LEGAL_UPDATED = '20. augusta 2026';

/**
 * Identification of the controller. IČO and the registered trade name must be filled in by the
 * salon — GDPR čl. 13 ods. 1 písm. a) requires the controller to be identifiable, and a street
 * address alone is not enough.
 */
export const CONTROLLER = {
    name: 'Svadobný salón Jarka',
    legalName: 'DOPLNIŤ — obchodné meno podľa živnostenského registra',
    ico: 'DOPLNIŤ — IČO',
    address: `${CONTACT.street}, ${CONTACT.city}`,
    email: CONTACT.email,
    phone: CONTACT.phone,
} as const;

export interface LegalSection {
    heading: string;
    paragraphs?: string[];
    bullets?: string[];
}

export const PRIVACY_SECTIONS: LegalSection[] = [
    {
        heading: 'Kto spracúva vaše údaje',
        paragraphs: [
            `Prevádzkovateľom je ${CONTROLLER.name}, ${CONTROLLER.legalName}, IČO ${CONTROLLER.ico}, so sídlom ${CONTROLLER.address}.`,
            `Vo veciach ochrany osobných údajov nás kontaktujte na ${CONTROLLER.email} alebo na čísle ${CONTROLLER.phone}. Zodpovednú osobu (DPO) nemáme určenú, nevyplýva nám to zo zákona.`,
            'Spracúvanie sa riadi nariadením (EÚ) 2016/679 (GDPR) a zákonom č. 18/2018 Z. z. o ochrane osobných údajov.',
        ],
    },
    {
        heading: 'Aké údaje spracúvame a prečo',
        paragraphs: [
            'Cez formulár rezervácie od vás žiadame meno a priezvisko, telefónne číslo, e-mail, typ šiat a preferovaný dátum a čas. Bez týchto údajov termín skúšky nedokážeme dohodnúť ani potvrdiť.',
            'Právnym základom je čl. 6 ods. 1 písm. b) GDPR — opatrenia pred uzatvorením zmluvy na vašu žiadosť. Súhlas na tento účel nepotrebujeme a ani oň nežiadame.',
            'Server ďalej krátkodobo zaznamenáva technické údaje o požiadavke (IP adresa, čas, typ prehliadača) v prevádzkových logoch. Robíme to na základe oprávneného záujmu podľa čl. 6 ods. 1 písm. f) GDPR — udržať stránku funkčnú a chrániť ju pred zneužitím.',
        ],
    },
    {
        heading: 'Ako dlho ich uchovávame',
        bullets: [
            'Potvrdené aj neuskutočnené rezervácie: 12 mesiacov od termínu skúšky, potom ich mažeme.',
            'Prevádzkové logy servera: najviac 30 dní.',
            'Údaje na daňovom doklade, ak k prenájmu alebo predaju dôjde: 10 rokov, ako to vyžaduje zákon o účtovníctve.',
        ],
    },
    {
        heading: 'Komu ich sprístupňujeme',
        paragraphs: [
            'Osobné údaje nepredávame a nepoužívame na reklamné profilovanie. Sprístupňujeme ich len sprostredkovateľom, ktorí pre nás zabezpečujú technickú prevádzku:',
        ],
        bullets: [
            'MongoDB Atlas (MongoDB Ltd.) — databáza rezervácií, hosťovaná v rámci EÚ.',
            'DigitalOcean LLC — server, na ktorom stránka beží.',
            'Intuit Mailchimp (Rocket Science Group LLC) — údaje z rezervačného formulára (meno, telefón, e-mail, požadovaný termín a typ šiat) posielame aj sem, aby sme žiadosť nestratili a vedeli vám odpísať.',
            'Google Ireland Ltd. — len ak si zapnete mapu na stránke Kontakt (pozri sekciu o cookies).',
        ],
    },
    {
        heading: 'Prenos mimo EÚ',
        paragraphs: [
            'Databáza aj server sú v Európskej únii. Mailchimp, ktorému posielame údaje z rezervačného formulára, spracúva údaje v Spojených štátoch na základe štandardných zmluvných doložiek schválených Európskou komisiou.',
            'Ak si zapnete vloženú mapu, Google môže vaše údaje spracúvať aj mimo EÚ na rovnakom základe. Bez vášho súhlasu sa mapa nenačíta a k žiadnemu takému prenosu nedôjde.',
        ],
    },
    {
        heading: 'Cookies a vložený obsah',
        paragraphs: ['Nepoužívame analytické, marketingové ani sledovacie cookies. Nemáme Google Analytics ani reklamné pixely.'],
        bullets: [
            'Nevyhnutné: prihlasovacia cookie správy obsahu (jarka_session, 8 hodín) — vzniká len po prihlásení do administrácie a je vyhradená pre salón.',
            'Nevyhnutné: záznam vášho rozhodnutia o súkromí v local storage prehliadača (jarka_consent) — bez neho by sme sa pýtali pri každom načítaní stránky.',
            'Voliteľné — vložený obsah: mapa Google Maps na stránke Kontakt. Načíta sa až po vašom súhlase; Google pri tom môže ukladať vlastné cookies.',
        ],
    },
    {
        heading: 'Ako súhlas zmeniť alebo odvolať',
        paragraphs: [
            'V pätičke stránky nájdete odkaz „Nastavenia súkromia“. Kliknutím sa vrátite k pôvodnej otázke a môžete rozhodnúť inak. Odvolanie súhlasu je rovnako jednoduché ako jeho udelenie a nemá vplyv na zákonnosť spracúvania pred odvolaním.',
        ],
    },
    {
        heading: 'Vaše práva',
        paragraphs: ['Podľa GDPR máte právo:'],
        bullets: [
            'na prístup k svojim údajom a na ich kópiu (čl. 15),',
            'na opravu nesprávnych údajov (čl. 16),',
            'na vymazanie — „právo na zabudnutie“ (čl. 17),',
            'na obmedzenie spracúvania (čl. 18),',
            'na prenosnosť údajov (čl. 20),',
            'namietať proti spracúvaniu na základe oprávneného záujmu (čl. 21),',
            'odvolať kedykoľvek súhlas tam, kde je spracúvanie na ňom založené (čl. 7 ods. 3).',
        ],
    },
    {
        heading: 'Ako si právo uplatniť a kam sa sťažovať',
        paragraphs: [
            `Napíšte nám na ${CONTROLLER.email} alebo zavolajte na ${CONTROLLER.phone}. Odpovieme najneskôr do jedného mesiaca od doručenia žiadosti.`,
            'Ak s vybavením nebudete spokojní, môžete podať sťažnosť dozornému orgánu: Úrad na ochranu osobných údajov Slovenskej republiky, Hraničná 12, 820 07 Bratislava, statny.dozor@pdp.gov.sk, www.dataprotection.gov.sk.',
        ],
    },
    {
        heading: 'Automatizované rozhodovanie a deti',
        paragraphs: [
            'Nepoužívame automatizované rozhodovanie ani profilovanie s právnym účinkom podľa čl. 22 GDPR. Rezervácie potvrdzuje majiteľka osobne, telefonicky.',
            'Stránka nie je určená deťom mladším ako 16 rokov. Ak rezervujete šaty na prvé sväté prijímanie, formulár vypĺňa rodič alebo zákonný zástupca a uvádza svoje vlastné kontaktné údaje.',
        ],
    },
];

export const TERMS_SECTIONS: LegalSection[] = [
    {
        heading: 'Prevádzkovateľ stránky',
        paragraphs: [
            `Túto stránku prevádzkuje ${CONTROLLER.name}, ${CONTROLLER.legalName}, IČO ${CONTROLLER.ico}, ${CONTROLLER.address}. Kontakt: ${CONTROLLER.email}, ${CONTROLLER.phone}.`,
        ],
    },
    {
        heading: 'Na čo stránka slúži',
        paragraphs: [
            'Stránka predstavuje ponuku salónu a umožňuje požiadať o termín skúšky. Nie je to e-shop — cez stránku sa nedá nič kúpiť ani zaplatiť.',
        ],
    },
    {
        heading: 'Rezervácia termínu nie je záväzná objednávka',
        paragraphs: [
            'Odoslaním formulára žiadate o termín. Rezervácia nevzniká automaticky a nie je potvrdená, kým vás majiteľka telefonicky nekontaktuje — spravidla do 24 hodín. Môže vám ponúknuť iný voľný dátum alebo čas.',
            'Termín si vyhradzujeme právo zrušiť alebo presunúť z prevádzkových dôvodov. Vždy vás o tom vopred informujeme na uvedené telefónne číslo.',
            'Ak sa na dohodnutý termín nemôžete dostaviť, dajte nám vedieť čo najskôr telefonicky.',
        ],
    },
    {
        heading: 'Ceny a dostupnosť',
        paragraphs: [
            'Ceny uvedené na stránke sú orientačné a nie sú návrhom na uzavretie zmluvy. Konečnú cenu určuje konkrétny model, sezóna a dĺžka požičania a dohodne sa priamo v salóne.',
            'Fotografie v galérii sú ilustračné. Dostupnosť konkrétneho modelu a veľkosti vieme potvrdiť len naživo — sortiment priebežne obmieňame.',
        ],
    },
    {
        heading: 'Autorské práva',
        paragraphs: [
            'Fotografie, texty a grafika na tejto stránke sú chránené autorským zákonom č. 185/2015 Z. z. Bez písomného súhlasu ich nemožno kopírovať, šíriť ani používať na komerčné účely.',
        ],
    },
    {
        heading: 'Odkazy na iné stránky',
        paragraphs: [
            'Stránka odkazuje na profily salónu na Instagrame a Facebooku a po vašom súhlase zobrazuje mapu Google Maps. Za obsah a podmienky týchto služieb nezodpovedáme, riadia sa vlastnými pravidlami.',
        ],
    },
    {
        heading: 'Zodpovednosť',
        paragraphs: [
            'Obsah stránky udržiavame aktuálny, no nezodpovedáme za škodu spôsobenú prípadnou nepresnosťou, nedostupnosťou stránky alebo výpadkom rezervačného formulára. V takom prípade nám, prosím, zavolajte.',
        ],
    },
    {
        heading: 'Ochrana osobných údajov',
        paragraphs: ['To, ako narábame s údajmi z rezervačného formulára, je popísané v samostatných Zásadách ochrany súkromia.'],
    },
    {
        heading: 'Rozhodné právo a zmeny podmienok',
        paragraphs: [
            'Tieto podmienky sa riadia právnym poriadkom Slovenskej republiky. Prípadné spory rieši príslušný súd SR.',
            'Podmienky môžeme zmeniť. Aktuálne znenie je vždy na tejto stránke spolu s dátumom poslednej aktualizácie.',
        ],
    },
];
