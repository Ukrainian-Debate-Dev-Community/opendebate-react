import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./ErrorPage.module.css";

interface ErrorPageProps {
  code: number;
  titleKey: string;
  messageKey: string;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  code,
  titleKey,
  messageKey,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className={styles.errorContainer}>
      <h1 className={styles.errorCode}>{code}</h1>
      <h2 className={styles.errorTitle}>{t(titleKey)}</h2>
      <p className={styles.errorMessage}>{t(messageKey)}</p>
      <button className={styles.homeButton} onClick={() => navigate("/")}>
        {t("common.backToHome")}
      </button>
    </div>
  );
};
