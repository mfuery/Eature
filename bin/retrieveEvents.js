const axios = require("axios")
const fs = require("fs")

// const { PREDICTHQ_API_TOKEN } = process.env
const PREDICTHQ_API_TOKEN = "-BjRdH8RLMokV48G47TpGTwQgsTUOLKI5c7OG7zp"

let data = loadFileData()
let nextUrl = fs.readFileSync("nexturl.txt", "utf8")
console.log(nextUrl)

download(nextUrl)
  .then((response) => {
    data = [...data, ...response.data.results]
    nextUrl = response.data.next

    saveFileData(data)

    if (!nextUrl) {
      console.log("No more next url")
      process.exit()
    }
    writeNextUrlFile(nextUrl)
  })
  .catch((error) => {
    console.log(error)
  })

///////////////////////////////////////////////////////
function loadFileData() {
  let data = []
  let fileData = null

  try {
    fileData = fs.readFileSync("data.json", "utf8")
  } catch (error) {
    console.error(error)
  }
  data = JSON.parse(fileData)

  return data
}

function saveFileData(data) {
  try {
    const outfile = fs.writeFileSync("data.json", JSON.stringify(data))
  } catch (error) {
    console.log(error)
  }
}

function writeNextUrlFile(url) {
  console.log(nextUrl)
  fs.writeFileSync("nexturl.txt", url)
}

function download(url) {
  return axios.get(url, {
    headers: {
      Authorization: "Bearer " + PREDICTHQ_API_TOKEN,
    },
  })
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item)
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function mergeDeep(target, ...sources) {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return mergeDeep(target, ...sources)
}
