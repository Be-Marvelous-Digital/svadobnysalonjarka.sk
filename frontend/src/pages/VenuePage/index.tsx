import { useState } from 'react';
import { ButtonAnchor, ButtonLink } from '@/components/Button';
import { CheckIcon, MailIcon, PhoneIcon } from '@/components/Icon';
import { Lightbox } from '@/components/Lightbox';
import { PhotoMosaic } from '@/components/PhotoMosaic';
import { PhotoMosaicSkeleton } from '@/components/PhotoMosaic/PhotoMosaicSkeleton';
import { StructuredData } from '@/components/StructuredData';
import { CONTACT } from '@/data/contact';
import { venueSchema } from '@/data/schema';
import { imageFor } from '@/data/siteImages';
import { VENUE, VENUE_HERO, VENUE_STORY, VENUE_USPS } from '@/data/venue';
import { photosOf, useGallery } from '@/hooks/useGallery';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useSiteImages } from '@/hooks/useSiteImages';
import { ROUTES } from '@/utils/routes';
import styles from './VenuePage.module.less';

export const VenuePage = () => {
    const { gallery, loading } = useGallery();
    const images = useSiteImages();
    const [lightboxIndex, setLightboxIndex] = useState(-1);

    const photos = photosOf(gallery, 'priestor');
    const hero = imageFor(images, 'venue.hero');

    usePageMeta({
        title: `Svadobný priestor ${VENUE.name} Topoľnica — Svadobný salón Jarka`,
        description: `Svadobná sála ${VENUE.name} v Topoľnici pri Galante. Pohostinstvo s kuchyňou na mieste, v deň svadby len pre vás. Šaty aj priestor na jednom mieste.`,
        image: hero,
    });

    return (
        <section className={styles.venue}>
            <StructuredData id="schema-venue" schema={venueSchema(hero)} />

            <header className={styles.venue__hero}>
                <div className={styles.venue__heroImage} style={{ backgroundImage: `url(${hero})` }} />
                <div className={styles.venue__scrim} />
                <div className={styles.venue__heroCopy} data-over-media="true">
                    <span className={styles.venue__kicker}>{VENUE_HERO.kicker}</span>
                    <h1 className={styles.venue__title}>{VENUE_HERO.title}</h1>
                    <p className={styles.venue__lead}>{VENUE_HERO.lead}</p>
                    <div className={styles.venue__heroActions}>
                        <ButtonAnchor href={CONTACT.phoneHref} variant="light">
                            <PhoneIcon /> Spýtať sa na termín
                        </ButtonAnchor>
                        <ButtonLink to={ROUTES.contact} variant="outline-light">
                            Kde nás nájdete
                        </ButtonLink>
                    </div>
                </div>
            </header>

            <div className={styles.venue__inner}>
                <div className={styles.venue__usps}>
                    {VENUE_USPS.map((usp) => (
                        <div key={usp.title} className={styles.usp}>
                            <span className={styles.usp__mark}>
                                <CheckIcon />
                            </span>
                            <h2 className={styles.usp__title}>{usp.title}</h2>
                            <p className={styles.usp__body}>{usp.body}</p>
                        </div>
                    ))}
                </div>

                {VENUE_STORY.map((section) => (
                    <article key={section.heading} className={styles.story}>
                        <h2 className={styles.story__heading}>{section.heading}</h2>
                        <div className={styles.story__body}>
                            {section.paragraphs.map((paragraph) => (
                                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                            ))}
                        </div>
                    </article>
                ))}

                {photos.length > 0 ? (
                    <PhotoMosaic sources={photos} label="Svadobný priestor" ratio={4 / 3} onOpen={setLightboxIndex} />
                ) : loading ? (
                    <PhotoMosaicSkeleton />
                ) : null}

                <div className={styles.venue__cta}>
                    <span className={styles.venue__ctaKicker}>Voľné termíny</span>
                    <h2 className={styles.venue__ctaTitle}>Povedzte nám dátum, zvyšok vyriešime spolu</h2>
                    <p className={styles.venue__ctaNote}>
                        Zavolajte alebo napíšte a poviem vám, či je váš termín ešte voľný. Ak si zároveň vyberáte šaty, vybavíme
                        oboje naraz.
                    </p>
                    <div className={styles.venue__ctaActions}>
                        <ButtonAnchor href={CONTACT.phoneHref} variant="gold">
                            <PhoneIcon /> {CONTACT.phone}
                        </ButtonAnchor>
                        <ButtonAnchor href={`mailto:${CONTACT.email}`} variant="outline-light">
                            <MailIcon /> {CONTACT.email}
                        </ButtonAnchor>
                    </div>
                </div>
            </div>

            {lightboxIndex >= 0 && photos[lightboxIndex] ? (
                <Lightbox
                    photos={photos}
                    index={lightboxIndex}
                    label="Svadobný priestor"
                    onClose={() => setLightboxIndex(-1)}
                    onNavigate={setLightboxIndex}
                />
            ) : null}
        </section>
    );
};
