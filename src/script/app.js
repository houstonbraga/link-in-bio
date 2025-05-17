//Api Fetch do spotify (Gibbs)

// --- CONFIGURAÇÃO COM SEUS DADOS ---
const clientId = "17878fa317c44abc95855cb2b1317c4c"; // Seu Client ID
const clientSecret = "8c74431a87a74035bfcf2b5b708859c5"; // Seu Client Secret
const artistId = "72Cw5jkxXCO61rlJhZ7oXe"; // ID do artista (Gibbs)

async function getAccessToken() {
  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + btoa(clientId + ":" + clientSecret),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await result.json();
  return data.access_token;
}

async function getLatestSingle(token) {
  const response = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=single&market=BR&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await response.json();
  return data.items[0];
}

async function getFirstTrackOfAlbum(token, albumId) {
  const response = await fetch(
    `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await response.json();
  return data.items[0];
}

async function extractDominantColor(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let r = 0,
        g = 0,
        b = 0,
        count = 0;

      for (let i = 0; i < data.length; i += 4 * 100) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }

      r = Math.floor((r / count) * 0.4); // escurecer
      g = Math.floor((g / count) * 0.4);
      b = Math.floor((b / count) * 0.4);

      resolve(`linear-gradient(135deg, rgb(${r},${g},${b}) 20%, #000000 90%)`);
    };
  });
}

async function main() {
  const token = await getAccessToken();
  const latestSingle = await getLatestSingle(token);
  const firstTrack = await getFirstTrackOfAlbum(token, latestSingle.id);

  const iframe = document.getElementById("spotify-iframe");
  iframe.src = `https://open.spotify.com/embed/track/${firstTrack.id}?theme=0`;

  const bgGradient = await extractDominantColor(latestSingle.images[0].url);
  const container = document.getElementById("player-container");
  container.style.background = bgGradient;
}

main().catch((e) => {
  console.error(e);
  alert("Erro ao carregar dados do Spotify.");
});
