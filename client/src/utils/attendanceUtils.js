export const countPresent = (slot = {}) => Object.values(slot).filter(Boolean).length;
export const countTotal   = (slot = {}) => Object.keys(slot).length;