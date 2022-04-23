export async function assertFunc(func: () => any, matchResult: any, matchError: any) {
  let error
  let result
  try {
    result = await func()
    console.log(JSON.stringify(result, null, 4))
  } catch (err) {
    console.log(
      JSON.stringify(
        {
          code   : err.code,
          message: err.message,
        },
        null,
        4,
      ),
    )
    error = err
  }

  if (matchResult) {
    expect(result).toMatchObject(matchResult)
  } else {
    expect(result).toBeUndefined()
  }

  if (matchError) {
    expect(error).toMatchObject(matchError)
  } else {
    expect(error).toBeUndefined()
  }
}

export function assertResult(func: () => any, matchObject: any) {
  return assertFunc(func, matchObject, void 0)
}

export function assertError(func: () => any, matchObject: any) {
  return assertFunc(func, void 0, matchObject)
}
