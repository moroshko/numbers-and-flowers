import React from "react";

function Circle({ orbitRadius, angle, radius, isSpecial }) {
  const radians = 2 * Math.PI * angle;

  return (
    <circle
      cx={Math.cos(radians) * orbitRadius}
      cy={-Math.sin(radians) * orbitRadius}
      r={radius}
      fill={isSpecial ? "#1666EE" : "#e99911"}
      stroke={isSpecial ? "#3A7DF0" : "#c5820f"}
    />
  );
}

export default Circle;
