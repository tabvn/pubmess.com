export const stringToJson = (str) => {

  try {
    str = JSON.parse(str)
  } catch (e) {

  }

  return str
}