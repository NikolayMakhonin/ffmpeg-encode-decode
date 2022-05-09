const exitOrig = process.exit
process.exit = function exit() {
  if (arguments[0]) {
    debugger
  }
  return exitOrig.apply(this, arguments)
} as any
