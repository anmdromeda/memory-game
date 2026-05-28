import { AppError } from "../errors/AppErrors";

interface RandomRangeConfig {
  min: number;
  max: number;
  count: number;
  allowDuplicates?: boolean;
}

export function generateRandomNumbers({ min, max, count, allowDuplicates = false }: RandomRangeConfig): number[] {
  if (min > max) {
    throw new AppError({
      message: `The 'min' value (${min}) cannot be greater than the 'max' value (${max}).`,
      code: "RANDOM_INVALID_RANGE",
    });
  }

  if (count <= 0) {
    return [];
  }

  const rangeLength = max - min + 1;

  if (!allowDuplicates && count > rangeLength) {
    throw new AppError({
      message: `Cannot generate ${count} unique random numbers within a range of ${rangeLength} total possibilities.`,
      code: "RANDOM_EXCEEDED_COUNT",
    });
  }

  const numbers: number[] = [];

  if (allowDuplicates) {
    for (let i = 0; i < count; i++) {
      const randomNumber = Math.floor(Math.random() * rangeLength) + min;
      numbers.push(randomNumber);
    }
    return numbers;
  }

  const uniqueSet = new Set<number>();
  while (uniqueSet.size < count) {
    const randomNumber = Math.floor(Math.random() * rangeLength) + min;
    uniqueSet.add(randomNumber);
  }

  return Array.from(uniqueSet);
}
