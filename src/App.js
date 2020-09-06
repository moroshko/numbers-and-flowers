import React, { useState, useMemo, useRef } from "react";
import Circle from "./Circle";
import { range } from "./utils";
import styles from "./App.module.css";

function getGCD(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  if (b > a) {
    var temp = a;
    a = b;
    b = temp;
  }
  while (true) {
    if (b === 0) return a;
    a %= b;
    if (a === 0) return b;
    b %= a;
  }
}

const FRACTION_REGEX = /^\s*(\d+)\s*\/\s*(\d+)\s*$/;
const FLOAT_REGEX = /^\s*[+-]?(\d+)(\.(\d+))?\s*$/;

function parseAngleValue(angleValue) {
  let match = angleValue.match(FRACTION_REGEX);

  if (match) {
    const numerator = +match[1];
    const denominator = +match[2];

    if (denominator === 0) {
      return {
        isValid: false,
        value: null,
        denominator: null,
      };
    }

    const gcd = getGCD(numerator, denominator);

    return {
      isValid: true,
      value: numerator / denominator,
      denominator: denominator / gcd,
    };
  }

  match = angleValue.match(FLOAT_REGEX);

  if (match) {
    let decimalPart = match[3];

    if (decimalPart === undefined) {
      return {
        isValid: true,
        value: parseFloat(angleValue),
        denominator: 1,
      };
    }

    // remove trailing 0s from the decimal part
    let i;

    for (i = decimalPart.length - 1; i >= 0; i--) {
      if (decimalPart[i] !== "0") {
        break;
      }
    }

    decimalPart = decimalPart.slice(0, i + 1);

    if (decimalPart === "") {
      // was all 0s before
      return {
        isValid: true,
        value: parseFloat(angleValue),
        denominator: 1,
      };
    }

    const denominator = Math.pow(10, decimalPart.length);
    const gcd = getGCD(+decimalPart, denominator);

    return {
      isValid: true,
      value: parseFloat(angleValue),
      denominator: denominator / gcd,
    };
  }

  return {
    isValid: false,
    value: null,
    denominator: null,
  };
}

function App() {
  const distanceBetweenOrbits = 1;
  const svgWidth = 700;
  const svgHeight = 700;
  const maxHalfSize = Math.max(svgWidth / 2, svgHeight / 2);
  const minCircleRadius = 4;
  const maxCircleRadius = 16;
  const svgSizeRatio = svgWidth / svgHeight;
  const minOrbitsCount = Math.floor(maxHalfSize / distanceBetweenOrbits);
  const maxOrbitsCount = minOrbitsCount * 3;
  const [orbitsCount, setOrbitsCount] = useState(minOrbitsCount);
  const viewbox = useMemo(() => {
    const largestCircleRadius = distanceBetweenOrbits * orbitsCount;

    if (svgHeight <= svgWidth) {
      const height = 2 * largestCircleRadius;
      const width = height * svgSizeRatio;

      return `-${width / 2} -${largestCircleRadius} ${width} ${height}`;
    }

    const width = 2 * largestCircleRadius;
    const height = width / svgSizeRatio;

    return `-${largestCircleRadius} -${height / 2} ${width} ${height}`;
  }, [distanceBetweenOrbits, orbitsCount, svgSizeRatio]);
  const circleRadiusFactor = (maxCircleRadius - minCircleRadius) / orbitsCount;
  const initialAngleValue = "5/99";
  const [angleValue, setAngleValue] = useState(initialAngleValue);
  const [parsedAngle, setParsedAngle] = useState(() =>
    parseAngleValue(angleValue)
  );
  const lastValidParsedAngle = useRef(parsedAngle);
  const parsedAngleToDraw = parsedAngle.isValid
    ? parsedAngle
    : lastValidParsedAngle.current;
  //const angle = 5 / 99; //1.618033988749894848204586834365638117720309179805762862135448;
  //const denominator = 99; //Infinity;

  return (
    <div className={styles.container}>
      <div>
        <label htmlFor="angle">Angle: </label>
        <input
          id="angle"
          type="text"
          value={angleValue}
          onChange={(e) => {
            const newAngleValue = e.target.value;

            setAngleValue(newAngleValue);

            const newParsedAngle = parseAngleValue(newAngleValue);

            if (newParsedAngle.isValid) {
              lastValidParsedAngle.current = newParsedAngle;
            }

            setParsedAngle(newParsedAngle);
          }}
        />
        {parsedAngle.isValid
          ? `${((parsedAngle.value * 360) % 360).toFixed(2)}°`
          : "Invalid"}
      </div>
      <div>
        <label htmlFor="orbits-count">Orbits: </label>
        <input
          id="orbits-count"
          type="range"
          min={minOrbitsCount}
          max={maxOrbitsCount}
          step="1"
          value={orbitsCount}
          onChange={(e) => {
            setOrbitsCount(Number(e.target.value));
          }}
        />
        {orbitsCount}
      </div>
      <svg
        className={styles.svg}
        width={svgWidth}
        height={svgHeight}
        viewBox={viewbox}
      >
        {distanceBetweenOrbits > 1 &&
          range(0, orbitsCount).map((i) => (
            <circle
              cx={0}
              cy={0}
              r={i * distanceBetweenOrbits || 0.5}
              stroke="rgba(0, 0, 0, 0.2)"
              fill="transparent"
              key={i}
            />
          ))}
        {range(1, orbitsCount).map((i) => (
          <Circle
            orbitRadius={i * distanceBetweenOrbits}
            angle={i * parsedAngleToDraw.value}
            radius={i * circleRadiusFactor + minCircleRadius}
            isSpecial={(i - 1) % parsedAngleToDraw.denominator === 0}
            key={i}
          />
        ))}
      </svg>
    </div>
  );
}

export default App;
