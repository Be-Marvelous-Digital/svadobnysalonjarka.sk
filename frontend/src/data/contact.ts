export const CONTACT = {
    salonName: 'Salón Jarka',
    tagline: 'Galanta · od roku 2007',
    street: 'Vajanského 1521',
    city: '924 01 Galanta',
    phone: '+421 948 416 066',
    phoneHref: 'tel:+421948416066',
    email: 'svadobnysalonjarka@gmail.com',
    instagram: 'https://www.instagram.com/svadobnysalonjarka/',
    facebook: 'https://www.facebook.com/SvadobnySalonJarka',
    mapEmbed: 'https://maps.google.com/maps?q=Vajansk%C3%A9ho%201521%2C%20Galanta&z=15&output=embed',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=Vajansk%C3%A9ho%201521%2C%20Galanta',
} as const;

export interface OpeningRow {
    day: string;
    hours: string;
    closed: boolean;
}

export const OPENING_ROWS: OpeningRow[] = [
    { day: 'Pondelok', hours: '10:00 – 17:00', closed: false },
    { day: 'Utorok', hours: '10:00 – 17:00', closed: false },
    { day: 'Streda', hours: '10:00 – 17:00', closed: false },
    { day: 'Štvrtok', hours: '10:00 – 17:00', closed: false },
    { day: 'Piatok', hours: '10:00 – 17:00', closed: false },
    { day: 'Sobota', hours: '9:00 – 12:00', closed: false },
    { day: 'Nedeľa', hours: 'Zatvorené', closed: true },
];

export const OPENING_SUMMARY = 'Po–Pi 10:00–17:00 · So 9:00–12:00 · Ne zatvorené';
