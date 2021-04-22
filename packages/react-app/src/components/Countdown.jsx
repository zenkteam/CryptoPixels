import React from "react";

// Countdown of remaining pixels

export default function Countdown({ soldPixels }) {
  const initialPixels = 9600;

  return (
    <div className="countdown">
        Remaining 100px-blocks: { initialPixels - soldPixels.length}
    </div>
  );
}
