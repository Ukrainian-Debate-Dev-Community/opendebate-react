import React from "react";
import { ErrorPage } from "./ErrorPage";

export const NotFoundPage: React.FC = () => {
  return (
    <ErrorPage
      code={404}
      titleKey="errors.404.title"
      messageKey="errors.404.message"
    />
  );
};
