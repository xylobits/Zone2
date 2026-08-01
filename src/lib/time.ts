export function isPastDate(iso: string) {
  return new Date(iso).getTime() < Date.now();
}
