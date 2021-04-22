import { PageHeader } from "antd";
import React from "react";
import { Link } from "react-router-dom";

// displays a page header

export default function Header() {
  
  return (
    <div className="header">
      <Link to="/">
        <PageHeader
          title="CryptoPixels.org"
          subTitle="Buy a piece of internet history and own it forever."
          className="pageHeader"
        />
      </Link>  
      <Link to="/trade">Trade</Link>&nbsp;|&nbsp;<Link to="/faq">FAQ</Link>&nbsp;|&nbsp;<Link to="/about">About</Link>
    </div>
  );
}
