import type React from 'react';
import styles from './index.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button className={styles.cButton} {...props}>
      {children}
    </button>
  );
};
