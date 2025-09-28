import jwt from 'jsonwebtoken';


export const generateToken = (payload: object): string => {
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d'})
};

export const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET!)
    } catch (error) {
        return null
    }
};

// export const excludeFields = <T, Key extends keyof T>(
//   obj: T,
//   keys: Key[]
// ): Omit<T, Key> => {
//   const result = { ...obj };
//   keys.forEach(key => delete result[key]);
//   return result;
// };

export function excludeFieldsFast<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: readonly K[]
): Omit<T, K> {
  const exclude = new Set(keys as unknown as (keyof T)[]);
  const out = {} as Omit<T, K>;
  for (const [k, v] of Object.entries(obj) as [keyof T, T[keyof T]][]) {
    if (!exclude.has(k)) {
      (out as any)[k] = v;
    }
  }
  return out;
}

