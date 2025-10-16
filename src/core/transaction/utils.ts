export function mathRound(num: number): number {
  const x = Math.floor(num);
  if (num - x >= 0.5) {
    return Math.sign(num) * Math.ceil(Math.abs(num));
  }
  return Math.sign(num) * x;
}

export function floatToHex(x: number): string {
  const result: string[] = [];
  let quotient = Math.floor(x);
  let fraction = x - quotient;
  let tempX = x;

  while (quotient > 0) {
    quotient = Math.floor(tempX / 16);
    const remainder = Math.floor(tempX - quotient * 16);

    if (remainder > 9) {
      result.unshift(String.fromCharCode(remainder + 55));
    } else {
      result.unshift(String(remainder));
    }

    tempX = quotient;
  }

  if (fraction === 0) {
    return result.join('');
  }

  result.push('.');

  while (fraction > 0) {
    fraction *= 16;
    const integer = Math.floor(fraction);
    fraction -= integer;

    if (integer > 9) {
      result.push(String.fromCharCode(integer + 55));
    } else {
      result.push(String(integer));
    }
  }

  return result.join('');
}

export function isOdd(num: number): number {
  return num % 2 ? -1.0 : 0.0;
}

export function interpolate(fromList: number[], toList: number[], f: number): number[] {
  if (fromList.length !== toList.length) {
    throw new Error(`Mismatched interpolation arguments ${fromList}: ${toList}`);
  }
  const out: number[] = [];
  for (let i = 0; i < fromList.length; i++) {
    out.push(fromList[i]! * (1 - f) + toList[i]! * f);
  }
  return out;
}

export function convertRotationToMatrix(rotation: number): number[] {
  const rad = (rotation * Math.PI) / 180;
  return [Math.cos(rad), -Math.sin(rad), Math.sin(rad), Math.cos(rad)];
}
