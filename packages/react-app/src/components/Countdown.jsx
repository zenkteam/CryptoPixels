import React from "react";

// Countdown of remaining pixels

export default function Countdown({ soldPixels }) {
  const initialPixels = 9600;
  const showWhenLessThen = 5000;
  const remainingPixels = initialPixels - soldPixels.length;

  if (remainingPixels < showWhenLessThen) {
    return (
      <div className="countdown">
          Remaining<span className="countdown-blocks"> 100px-blocks</span>: { remainingPixels }
      </div>
    );
  } else {
    return ''
  }
}
