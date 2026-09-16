export interface PriceRow {
    name: string;
    note?: string;
    price: string;
}

export interface PriceGroup {
    title: string;
    intro: string;
    rows: PriceRow[];
}

export const PRICE_GROUPS: PriceGroup[] = [
    {
        title: 'Požičovné',
        intro: 'Požičovné šiat a oblekov. V cenách nie sú započítané možné úpravy.',
        rows: [
            {
                name: 'Prijímacie šaty',
                note: 'Veľkosti 122 – 170 cm. Vždy záleží od modelu šiat. Pre vyspelejšie a väčšie dievčatá je výnimočne možný výber zo svadobných šiat, pri ktorých vám cenu prispôsobíme.',
                price: '30 – 180 €',
            },
            {
                name: 'Obleky na 1. sv. prijímanie',
                note: 'Obleky vieme nakombinovať farebne aj veľkostne a odev upravujeme, takže si u nás vyberie každý chlapec.',
                price: '30 – 150 €',
            },
            {
                name: 'Spoločenské šaty',
                note: 'Cenu tvorí model a honosnosť šiat. Vyberú si u nás štíhle žienky aj moletky, veľkosti máme až do 60.',
                price: '50 – 490 €',
            },
            {
                name: 'Obleky pre chlapcov a mužov',
                note: 'V ponuke máme luxusné aj obyčajné obleky, takmer na každú príležitosť.',
                price: '50 – 250 €',
            },
            {
                name: 'Svadobné šaty',
                note: 'Od snehobielej farby až po bledoružovú alebo tmavú krémovú, veľkosti od 32 po 60. Ponuku stále dopĺňame o najnovšie trendy.',
                price: '200 – 990 €',
            },
        ],
    },
    {
        title: 'Predaj',
        intro: 'Predaj šiat, oblekov, doplnkov a poskytovanie rôznych služieb.',
        rows: [
            { name: 'Prijímacie šaty', price: '100 – 790 €' },
            { name: 'Obleky na 1. sv. prijímanie', price: '80 – 300 €' },
            { name: 'Spoločenské šaty', price: '50 – 600 €' },
            { name: 'Obleky pre chlapcov a mužov', price: '80 – 300 €' },
            { name: 'Svadobné šaty', price: '50 – 2 000 €' },
            {
                name: 'Bižutéria',
                note: 'Obyčajná bižutéria aj antialergénna jablonecká bižutéria zo skla, ručne brúsená.',
                price: '5 – 100 €',
            },
            { name: 'Úprava svadobných a spoločenských šiat', price: '10 – 100 €' },
        ],
    },
];

export const PRICE_CONDITIONS = [
    { title: 'Úpravy', body: 'V cenách požičovného nie sú započítané prípadné úpravy šiat a oblekov.' },
    { title: 'Vak a vešiak', body: 'Za stratu firemného vaku sa účtuje 30 €, za stratu vešiaka 10 €.' },
    { title: 'Vrátenie', body: 'Za nedodržanie termínu vrátenia šiat účtujeme 30 € za každý deň.' },
    { title: 'Dlhšie požičanie', body: 'Ak potrebujete šaty zapožičať na dlhšiu dobu, je možné sa dohodnúť.' },
];
