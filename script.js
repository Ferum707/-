let words = [];

document.addEventListener("DOMContentLoaded", async () => {
  await loadWords();

  document.getElementById("searchButton").addEventListener("click", () => {
    const query = document.getElementById("searchInput").value;
    const selectedSource = document.getElementById("sourceFilter").value;

    const results = searchWords(query, selectedSource);
    renderResults(results);
  });

  document.getElementById("searchInput").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      document.getElementById("searchButton").click();
    }
  });

  document.getElementById("sourceFilter").addEventListener("change", () => {
    document.getElementById("searchButton").click();
  });
});

async function loadWords() {
  try {
    const response = await fetch("words.json", { cache: "no-cache" });
    words = await response.json();
  } catch (error) {
    document.getElementById("results").innerHTML = `
      <div class="not-found">
        Ошибка загрузки базы words.json. Проверьте файл и его расположение.
      </div>
    `;
    console.error("Ошибка загрузки words.json:", error);
  }
}

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replaceAll("ё", "е")
    .replaceAll("ъ", "")
    .replaceAll("ь", "")
    .trim();
}

function searchWords(query, selectedSource) {
  const normalizedQuery = normalizeText(query);

  return words.filter(item => {
    const matchesSource =
      selectedSource === "all" || item.source === selectedSource;

    const fields = [
      item.word,
      item.normalized,
      item.meaning,
      item.category,
      item.source,
      item.example,
      item.comment,
      item.dictionaryName,
      item.dictionaryUrl
    ];

    const matchesQuery =
      normalizedQuery === "" ||
      fields.some(field => normalizeText(field).includes(normalizedQuery));

    return matchesSource && matchesQuery;
  });
}

function renderResults(results) {
  const resultsBlock = document.getElementById("results");

  if (results.length === 0) {
    resultsBlock.innerHTML = `
      <div class="not-found">
        Ничего не найдено. Проверьте написание слова или выберите другой памятник.
      </div>
    `;
    return;
  }

  resultsBlock.innerHTML = "";

  results.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    const dictionaryHtml = item.dictionaryUrl
      ? `
        <p>
          <span class="label">Словарь-источник:</span>
          <a href="${item.dictionaryUrl}" target="_blank" rel="noopener noreferrer">
            ${item.dictionaryName || item.dictionaryUrl}
          </a>
        </p>
      `
      : `
        <p>
          <span class="label">Словарь-источник:</span>
          не указан
        </p>
      `;

    card.innerHTML = `
      <span class="badge">${item.category}</span>

      <h2>${item.word}</h2>

      <p><span class="label">Значение:</span> ${item.meaning}</p>
      <p><span class="label">Памятник:</span> ${item.source}</p>
      <p><span class="label">Комментарий:</span> ${item.comment}</p>

      ${dictionaryHtml}

      <div class="example">
        <p><span class="label">Пример:</span> ${item.example}</p>
        <p>
          <a href="${item.sourceFile}#${item.fragment}">
            Открыть место в полном тексте
          </a>
        </p>
      </div>
    `;

    resultsBlock.appendChild(card);
  });
}
