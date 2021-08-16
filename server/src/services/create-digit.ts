const getNumRand = () => Math.floor(Math.random() * 10);

export default function createDigit(length: number): string {
  return Array(length)
    .fill(0)
    .reduce((acc: string[]) => {
      acc.push(String(getNumRand()));
      return acc;
    }, [])
    .join('');
}
