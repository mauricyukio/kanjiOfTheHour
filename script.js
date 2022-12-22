const kanjiElement = document.querySelector('.kanji')
const meaningElement = document.querySelector('.meaning')

const backgroundPhoto = document.querySelector('.background-photo')
const credits = document.querySelector('.credits')

// const backgroundPhotoObject = {
//   id: 'Dwu85P9SOIk',
//   created_at: '2016-05-03T11:00:28-04:00',
//   updated_at: '2016-07-10T11:00:01-05:00',
//   width: 2448,
//   height: 3264,
//   color: '#6E633A',
//   blur_hash: 'LFC$yHwc8^$yIAS$%M%00KxukYIp',
//   downloads: 1345,
//   likes: 24,
//   liked_by_user: false,
//   description: 'A man drinking a coffee.',
//   exif: {
//     make: 'Canon',
//     model: 'Canon EOS 40D',
//     exposure_time: '0.011111111111111112',
//     aperture: '4.970854',
//     focal_length: '37',
//     iso: 100,
//   },
//   location: {
//     name: 'Montreal, Canada',
//     city: 'Montreal',
//     country: 'Canada',
//     position: {
//       latitude: 45.473298,
//       longitude: -73.638488,
//     },
//   },
//   current_user_collections: [
//     // The *current user's* collections that this photo belongs to.
//     {
//       id: 206,
//       title: 'Makers: Cat and Ben',
//       published_at: '2016-01-12T18:16:09-05:00',
//       last_collected_at: '2016-06-02T13:10:03-04:00',
//       updated_at: '2016-07-10T11:00:01-05:00',
//       cover_photo: null,
//       user: null,
//     },
//     // ... more collections
//   ],
//   urls: {
//     raw: 'https://images.unsplash.com/photo-1417325384643-aac51acc9e5d',
//     full: 'https://images.unsplash.com/photo-1417325384643-aac51acc9e5d?q=75&fm=jpg',
//     regular:
//       'https://images.unsplash.com/photo-1417325384643-aac51acc9e5d?q=75&fm=jpg&w=1080&fit=max',
//     small: 'https://images.unsplash.com/photo-1417325384643-aac51acc9e5d?q=75&fm=jpg&w=400&fit=max',
//     thumb: 'https://images.unsplash.com/photo-1417325384643-aac51acc9e5d?q=75&fm=jpg&w=200&fit=max',
//   },
//   links: {
//     self: 'https://api.unsplash.com/photos/Dwu85P9SOIk',
//     html: 'https://unsplash.com/photos/Dwu85P9SOIk',
//     download: 'https://unsplash.com/photos/Dwu85P9SOIk/download',
//     download_location: 'https://api.unsplash.com/photos/Dwu85P9SOIk/download',
//   },
//   user: {
//     id: 'QPxL2MGqfrw',
//     updated_at: '2016-07-10T11:00:01-05:00',
//     username: 'exampleuser',
//     name: 'Joe Example',
//     portfolio_url: 'https://example.com/',
//     bio: 'Just an everyday Joe',
//     location: 'Montreal',
//     total_likes: 5,
//     total_photos: 10,
//     total_collections: 13,
//     instagram_username: 'instantgrammer',
//     twitter_username: 'crew',
//     links: {
//       self: 'https://api.unsplash.com/users/exampleuser',
//       html: 'https://unsplash.com/exampleuser',
//       photos: 'https://api.unsplash.com/users/exampleuser/photos',
//       likes: 'https://api.unsplash.com/users/exampleuser/likes',
//       portfolio: 'https://api.unsplash.com/users/exampleuser/portfolio',
//     },
//   },
// }

displayOnScreen()

async function generateNewKanji() {
  // Get random kanji and kanji info from Kanji API
  const kanjiList = await getKanjiList()
  const randomKanji = getRandomKanji(kanjiList)
  const kanjiInfo = await getKanjiInfo(randomKanji)
  const kanjiMeaning = kanjiInfo.meanings[0]

  // Get random related picture from Unsplash API
  const backgroundPhotoObject = await getBackgroundPhoto(kanjiMeaning)

  // Save new kanji to the Kanji History database
  updateKanjiHistory(randomKanji, kanjiMeaning, backgroundPhotoObject)
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
      response = await fetch(
        `https://api.unsplash.com/photos/random?client_id=${apiKey}&query=japan&orientation=landscape`
      )
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

  credits.innerHTML = `<p>Kanji by <a href="https://kanjiapi.dev/">KanjiAPI</a></p>
  <p>Photo by <a href='${backgroundPhotoAuthorLink}'>${backgroundPhotoAuthor}</a> on <a href=${backgroundPhotoPage}>Unsplash</a></p>`
}

async function updateKanjiHistory(kanji, meaning, photo) {
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
    }),
  })

  const convertedConnection = await connection.json()
  return convertedConnection
}

async function displayOnScreen() {
  const connection = await fetch('http://localhost:3000/kanji')
  const kanjiHistory = await connection.json()
  const lastKanji = kanjiHistory[Object.keys(kanjiHistory)[Object.keys(kanjiHistory).length - 1]]

  kanjiElement.innerHTML = `<a href="https://jisho.org/search/${lastKanji.kanji}">${lastKanji.kanji}</a>`
  meaningElement.innerHTML = `- ${lastKanji.meaning} -`
  displayPhotoOnScreen(lastKanji.photo)
}
