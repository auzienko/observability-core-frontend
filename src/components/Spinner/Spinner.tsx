import React from 'react';
import styles from './Spinner.module.css';

export const Spinner: React.FC = () => {
  return (
    <div className={styles.spinnerOverlay}>
      <div className={styles.spinnerContainer} />
    </div>
  );
};
