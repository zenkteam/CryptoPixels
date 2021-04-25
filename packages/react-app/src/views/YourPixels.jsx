import React from "react";
import { YourPixel } from "../components";

export default function YourPixels(props) {

  return (
    <div className="textPage">
      <h2>Your Pixels</h2>

      { props.ownCryptoPixels.map((cryptoPixel) => (
        <YourPixel key={cryptoPixel[0]} cryptoPixel={cryptoPixel} />
      ))}
    </div>
  );
}
