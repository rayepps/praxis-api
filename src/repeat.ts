import _ from 'radash'

// Write a program that takes these values to find all of the different patterns 
// in "input" of length "patternLength"and output all of the patterns that occur 
// more than once and the number of times they occur. For example, when searching 
// the string "zf3kabxcde224lkzf3mabxc51+crsdtzf3nab=", with a specified pattern 
// length of 3, the method should return the pattern "abx” with an occurrence 
// value of two, and “zf3” with an occurrence value of three.


const createSlices = (str: string, length: number): string[] => {
  return _.iter(str.length - length + 1, (acc: string[], idx: number) => (
    [...acc, str.substr(idx - 1, length)]
  ), [] as string[])
}

const countOccurrences = <T extends string | number | symbol>(list: T[]): Record<T, number> => {
  return list.reduce((acc: Record<T, number>, item: T) => ({
    ...acc,
    [item]: (acc[item] ?? 0) + 1
  }), {} as Record<T, number>)
}

const filterValues = <T>(valueCondition: (item: T) => boolean) => (dict: Record<string, T>) => {
  return Object.entries(dict).reduce((acc: Record<string, T>, [key, value]: [string, T]) => {
    return valueCondition(value) ? { ...acc, [key]: value } : acc
  }, {} as Record<string, T>)
}

const objectsEqual = (obj1: object, obj2: object): boolean => {
  return Object.keys(obj1)
    .concat(Object.keys(obj2))
    .every(key => obj1[key] === obj2[key])
}

const main = () => {

  const findRepeatingPatterns = _.chain(
    createSlices,
    countOccurrences,
    filterValues(x => x > 1)
  ) as (input: string, patternLength: number) => Record<string, number> 

  const testCase = (input: string, patternLength: number, expected: Record<string, number>) => {
    const result = findRepeatingPatterns(input, patternLength)
    if (!objectsEqual(result, expected)) {
      console.log(`FAIL: ${input}`)
      console.log('expected: ', expected)
      console.log('actual: ', result)
      throw 'Test Case Failed'
    }
    console.log(`PASS: ${input}`)
  }

  testCase("zf3kabxcde224lkzf3mabxc51+crsdtzf3nab=", 3, {
    "zf3": 3,
    "abx": 2,
    "bxc": 2
  })

  testCase("xxr2j1xxr28hxxr2", 4, {
    "xxr2": 3
  });

  testCase("abc1_abc2_abc3_abc4", 4, {
    "_abc": 3
  });

  testCase("1234567", 2, {});

  testCase("", 9, {});

}

main()