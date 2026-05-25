/** MongoDB ObjectId string (24 hex chars). */
export function isValidObjectId(id) {
  return typeof id === 'string' && /^[a-f\d]{24}$/i.test(id);
}

export function validateDependencyIds(ids) {
  const invalid = ids.filter((id) => !isValidObjectId(id));
  if (invalid.length) {
    return `Invalid dependency ID(s): ${invalid.join(', ')}`;
  }
  return null;
}
