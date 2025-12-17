import type * as React from "react";

interface Props {
  children: React.ReactNode;
}

export default async function Layout(props: Props) {
  const { children } = props;

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
