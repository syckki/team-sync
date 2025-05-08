export function mergeData(source, target, altered) {
  const result = structuredClone(source);

  for (const key in target) {
    const sourceVal = source[key];
    const targetVal = target[key];

    const alteredVal = altered[key];

    if (Array.isArray(sourceVal) && Array.isArray(targetVal)) {
      const resultArray = mergeDataValue(sourceVal, targetVal, alteredVal);
      result[key] = resultArray;
    } else if (typeof sourceVal === "object" && typeof targetVal === "object") {
      result[key] = mergeData(sourceVal, targetVal, alteredVal);
    }
  }

  return result;
}

export function mergeDataValue(sourceVal, targetVal, alteredVal) {
  if (!alteredVal) return sourceVal;

  const resultArray = [...sourceVal];

  for (let i = 0; i < targetVal.length; i++) {
    const isNew = alteredVal[i] === "new";
    const isEdited = alteredVal[i] === "edited";

    if (i < resultArray.length && isEdited) {
      resultArray[i] = targetVal[i];
    } else if (isNew && !resultArray.includes(targetVal[i])) {
      resultArray.push(targetVal[i]);
    }
  }

  return resultArray;
}
