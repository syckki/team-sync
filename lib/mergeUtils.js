export function mergeData(source, target, altered) {
  const result = structuredClone(source);

  for (const key in target) {
    const sourceVal = source[key];
    const targetVal = target[key];

    const alteredVal = altered[key];

    if (!alteredVal) continue;

    if (Array.isArray(sourceVal) && Array.isArray(targetVal)) {
      for (let i = 0; i < targetVal.length; i++) {
        const isNew = alteredVal[i] === "new";
        const isEdited = alteredVal[i] === "edited";

        if (i < sourceVal.length && isEdited) {
          sourceVal[i] = targetVal[i];
        } else if (isNew && !sourceVal.includes(targetVal[i])) {
          sourceVal.push(targetVal[i]);
        }
      }
    } else if (typeof sourceVal === "object" && typeof targetVal === "object") {
      result[key] = mergeData(sourceVal, targetVal, alteredVal);
    }
  }

  return result;
}

export function mergeDataValue(sourceVal, targetVal, alteredVal) {
  if (!alteredVal) return;

  const result = structuredClone(sourceVal);

  for (let i = 0; i < targetVal.length; i++) {
    const isNew = alteredVal[i] === "new";
    const isEdited = alteredVal[i] === "edited";

    if (i < result.length && isEdited) {
      result[i] = targetVal[i];
    } else if (isNew && !result.includes(targetVal[i])) {
      result.push(targetVal[i]);
    }
  }

  return result;
}
