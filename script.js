// Haku AvoinData API:sta

async function fetchAvoinData(query) {
    const apiURL = "https://www.avoindata.fi/data/api/3/action/package_search";
    const params = new URLSearchParams({
      q: query, // Hakusana
    });

    try {
        const response = await fetch(`${apiURL}?${params}`);
        if (!response.ok) throw new Error(`HTTP virhe! Status: ${response.status}`);
        const data = await response.json();

        if (data.success) {
            console.log(data.result.results); // Tulostetaan hakutulokset konsoliin
            const relevantData = extractRelevantData(data.result.results); // Poimitaan vain tarvittavat tiedot
            displayAvoinData(relevantData); // Näytetään data HTML-sivulla
            localStorage.setItem('searchResults', JSON.stringify(relevantData)); // Tallennetaan suodatetut hakutulokset localStorageen
            document.getElementById("load-more").style.display = 'block'; // Näytetään "Lataa lisää" nappula
        } else {
            console.error("Haku epäonnistui:", data.error);
            document.getElementById("load-more").style.display = 'none'; // Piilotetaan nappula, jos ei ole tuloksia
        }
    } catch (error) {
        console.error("Virhe datan hakemisessa:", error);
        document.getElementById("load-more").style.display = 'none'; // Piilotetaan nappula virhetilanteessa
    }
}
// Funktio, joka poimii vain relevantit tiedot ja etsii linkin "resources"-kentästä
function extractRelevantData(results) {
    return results.map(dataset => {
      // Etsitään ensimmäinen resurssi, joka on datasetin linkki
      const url = dataset.resources && dataset.resources.length > 0 ? dataset.resources[0].url : null;
      
      return {
        title: dataset.title, // Aineiston nimi
        notes: dataset.notes || "Ei kuvausta saatavilla.", // Aineiston kuvaus
        url: url, // Linkki aineistoon
      };
    });
  }
// Funktio JSON-datan tallentamiseen selaimessa
function saveJSONToBrowser(data, filename = "hakutulokset.json") {
  const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(jsonBlob);
  downloadLink.download = filename;

  // Käynnistä tiedoston lataus
  downloadLink.click();
}

// Näytetään hakutulokset sivulla
function displayAvoinData(results) {
    const container = document.getElementById("data-container");
    if (results.length > 0) {
        results.forEach((dataset) => {
            const item = document.createElement("div");
            item.className = "data-item";
            const datasetLink = dataset.url ? 
            `<a href="${dataset.url}" target="_blank">Avaa aineisto avoindata.fi:ssä</a>` 
            : "Ei linkkiä saatavilla";
            item.innerHTML = `
            <h3>${dataset.title}</h3>
            <p>${dataset.notes || "Ei kuvausta saatavilla."}</p>
            <a href="${dataset.url}" target="_blank">Linkki aineistoon</a>
            `;
            container.appendChild(item);
        });
        // Näytetään "Lataa lisää" -nappula vain, jos on hakutuloksia
        document.getElementById("load-more").style.display = 'block';
    } else {
        container.innerHTML = "<p>Ei hakutuloksia.</p>";
        document.getElementById("load-more").style.display = 'none'; // Piilotetaan nappula, jos ei tuloksia
    }
}

// Haku käynnistyy lomakkeen lähettämisestä
document.getElementById("search-form").addEventListener("submit", (event) => {
    event.preventDefault(); // Estetään lomakkeen normaali lähetys
    const query = document.getElementById("search-input").value;
    document.getElementById("data-container").innerHTML = ""; // Tyhjennetään edelliset hakutulokset
    document.getElementById("load-more").style.display = 'none'; // Piilotetaan nappula ennen hakutuloksia
    fetchAvoinData(query); // Haetaan dataa annetulla hakusanalla
});

// Ladataan JSON-tiedosto napin klikkauksella
document.getElementById("download-json").addEventListener("click", () => {
  const results = JSON.parse(localStorage.getItem('searchResults')) || []; // Ladataan aiemmin haetut tiedot
  saveJSONToBrowser(results);
  console.log(results);
});

document.getElementById("load-more").addEventListener("click", () => {
  const query = document.getElementById("search-input").value;
  fetchAvoinData(query); // Haetaan lisää hakutuloksia samalla hakusanalla
});