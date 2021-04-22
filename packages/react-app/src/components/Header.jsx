import { PageHeader } from "antd";
import React from "react";
import { Link } from "react-router-dom";

// displays a page header

export default function Header() {
  
  return (
    <Link to="/">
      <PageHeader
        title="CryptoPixels.org"
        subTitle="Buy a piece of internet history and own it forever."
        className="pageHeader"
      />
    </Link>
  );
}
