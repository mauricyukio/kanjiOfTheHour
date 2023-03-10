import * as htmlToImage from './node_modules/html-to-image'
import { toPng } from './node_modules/html-to-image'

const kanjiElement = document.querySelector('.kanji')
const meaningElement = document.querySelector('.meaning')

const titleScreen = document.querySelector('.title-screen')
const backgroundPhoto = document.querySelector('.background-photo')
const credits = document.querySelector('.credits')

main()

const printButton = document.querySelector('[data-print]')
printButton.addEventListener('click', printScreen)

function printScreen() {
  // const canvas = document.createElement('canvas')
  // canvas.width = window.innerWidth
  // canvas.height = window.innerHeight

  // const image = canvas.toDataURL('image/jpeg')
  // console.log(image)

  const body = document.querySelector('body')

  htmlToImage
    .toPng(body)
    .then(function (dataUrl) {
      var img = new Image()
      img.src = dataUrl
      document.body.appendChild(img)
    })
    .catch(function (error) {
      console.error('oops, something went wrong!', error)
    })
}

async function main() {
  const lastKanji = await getLastKanji()

  const hourNow = new Date().getHours()
  const lastKanjiHour = new Date(lastKanji.entryDate).getHours()

  hourNow === lastKanjiHour ? displayScreen(lastKanji) : generateNewKanji()
}

function displayScreen(lastKanji) {
  kanjiElement.innerHTML = `<a href="https://jisho.org/search/${lastKanji.kanji}" target="_blank" rel="noopener noreferrer">${lastKanji.kanji}</a>`
  meaningElement.innerHTML = `· ${lastKanji.meaning} ·`
  displayPhotoOnScreen(lastKanji.photo)

  setTimeout(() => titleScreen.classList.add('hide'), 2000)
  setTimeout(() => (titleScreen.style.visibility = 'hidden'), 4000)
}

async function getLastKanji() {
  const connection = await fetch('http://localhost:3000/kanji')
  const kanjiHistory = await connection.json()
  const lastKanji = kanjiHistory[Object.keys(kanjiHistory)[Object.keys(kanjiHistory).length - 1]]
  return lastKanji
}

async function generateNewKanji() {
  // Get random kanji and kanji info from Kanji API
  const kanjiList = await getKanjiList()
  const randomKanji = getRandomKanji(kanjiList)
  const kanjiInfo = await getKanjiInfo(randomKanji)
  const kanjiMeaning = kanjiInfo.meanings[0]

  // Get random related picture from Unsplash API
  const backgroundPhotoObject = await getBackgroundPhoto(kanjiMeaning)

  // Save new kanji to the Kanji History database
  await updateKanjiHistory(randomKanji, kanjiMeaning, backgroundPhotoObject)

  // Restart the application
  main()
}

async function getKanjiList() {
  try {
    const response = await fetch('https://kanjiapi.dev/v1/kanji/joyo')
    const allKanjiArray = await response.json()
    return allKanjiArray
  } catch (error) {
    console.log(error)
  }
}

function getRandomKanji(list) {
  const randomIndex = Math.floor(Math.random() * list.length)
  return list[randomIndex]
}

async function getKanjiInfo(kanji) {
  try {
    const response = await fetch(`https://kanjiapi.dev/v1/kanji/${kanji}`)
    const kanjiInfo = await response.json()
    return kanjiInfo
  } catch (error) {
    console.log(error)
  }
}

async function getBackgroundPhoto(query) {
  const apiKey = 'fduTtxJ5GatUpLYtVTFoTz5ynsOF3VpVpxfXl9yTwbk'
  try {
    var response = await fetch(
      `https://api.unsplash.com/photos/random?client_id=${apiKey}&query=${query}&orientation=landscape`
    )
    if (response.status === 404) {
      try {
        response = await fetch(
          `https://api.unsplash.com/photos/random?client_id=${apiKey}&query=japan&orientation=landscape`
        )
      } catch (error) {
        console.log(error)
      }
      throw new Error('No images available for this query. Showing a random Japan image instead.')
    }
    const randomPicture = await response.json()
    return randomPicture
  } catch (error) {
    console.log(error)
  }
}

function displayPhotoOnScreen(photo) {
  const backgroundPhotoURL = photo.url
  const backgroundPhotoPage = photo.page
  const backgroundPhotoAuthor = photo.author
  const backgroundPhotoAuthorLink = photo.authorLink

  backgroundPhoto.style.background = `url("${backgroundPhotoURL}")`
  backgroundPhoto.style.backgroundSize = 'cover'
  backgroundPhoto.style.backgroundPosition = 'center'

  credits.innerHTML = `<p>Kanji by <a href="https://kanjiapi.dev/" target="_blank" rel="noopener noreferrer">KanjiAPI</a></p>
  <p>Photo by <a href="${backgroundPhotoAuthorLink}" target="_blank" rel="noopener noreferrer">${backgroundPhotoAuthor}</a> on <a href="${backgroundPhotoPage}" target="_blank" rel="noopener noreferrer">Unsplash</a></p>`
}

async function updateKanjiHistory(kanji, meaning, photo) {
  const now = new Date().toJSON()
  const connection = await fetch('http://localhost:3000/kanji', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      kanji: kanji,
      meaning: meaning,
      photo: {
        url: photo.urls.full,
        page: photo.links.html,
        author: photo.user.name,
        authorLink: photo.user.portfolio_url || photo.user.links.html,
      },
      entryDate: now,
    }),
  })

  const convertedConnection = await connection.json()
  return convertedConnection
}
