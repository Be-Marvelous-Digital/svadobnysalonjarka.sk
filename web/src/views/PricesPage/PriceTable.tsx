import { Fragment } from 'react';
import type { PriceGroup } from '@/data/prices';
import styles from './PricesPage.module.scss';

interface PriceTableProps {
    group: PriceGroup;
}

export const PriceTable = ({ group }: PriceTableProps) => (
    <div className={styles.prices__group}>
        <div className={styles.prices__groupHead}>
            <h2 className={styles.prices__groupTitle}>{group.title}</h2>
            <p className={styles.prices__groupIntro}>{group.intro}</p>
        </div>

        <div className={styles.prices__table}>
            {group.rows.map((row) => (
                <Fragment key={row.name}>
                    <div className={styles.prices__item}>
                        <span className={styles.prices__itemName}>{row.name}</span>
                        {row.note ? <span className={styles.prices__itemNote}>{row.note}</span> : null}
                    </div>
                    <div className={styles.prices__price}>{row.price}</div>
                </Fragment>
            ))}
        </div>
    </div>
);
