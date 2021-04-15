import React from "react";
import { PageHeader } from "antd";

// displays a page header

export default function Header() {
  return (
    <a href="https://cryptopixels.org" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="CryptoPixels.org"
        subTitle="Buy a piece of internet history and own it forever."
        style={{ cursor: "pointer" }}
      />
    </a>  
  );
}
