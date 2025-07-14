import { nanoid } from 'nanoid';
import { randomUUID } from "node:crypto";

export type IdType = 'UUID' | 'NANOID';

export function createId(type: IdType = 'UUID') {
  if (type === 'UUID') return randomUUID();
  if (type === 'NANOID') return nanoid(10);
  throw new Error('Invalid ID type');
}
