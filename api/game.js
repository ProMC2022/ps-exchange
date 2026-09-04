// api/game.js

export default async function handler(req, res) {
  try {
    const apiKey = process.env.NEXT_RAWG_API_KEY;
    const id = req.query.id;

    if (!apiKey) {
      return res.status(500).json({ error: "Переменная NEXT_RAWG_API_KEY не настроена в Vercel" });
    }

    if (!id) {
      return res.status(400).json({ error: "Не указан ID игры" });
    }

    // Собираем ссылку через обычные кавычки и плюсы, чтобы исключить опечатки с кавычкой "Ё"
    const urlMain = "https://rawg.io" + id + "?key=" + apiKey;
    const mainResponse = await fetch(urlMain);
    const mainData = await mainResponse.json();

    // Собираем вторую ссылку для скриншотов
    const urlScreens = "https://rawg.io" + id + "/screenshots?key=" + apiKey;
    const screenshotsResponse = await fetch(urlScreens);
    const screenshotsData = await screenshotsResponse.json();

    // Формируем чистый объект для фронтенда
    const fullGameData = {
      id: mainData.id,
      name: mainData.name,
      description: mainData.description_raw || mainData.description,
      background_image: mainData.background_image,
      rating: mainData.rating,
      released: mainData.released,
      metacritic: mainData.metacritic,
      developers: mainData.developers ? mainData.developers.map(d => d.name) : [],
      genres: mainData.genres ? mainData.genres.map(g => g.name) : [],
      screenshots: screenshotsData.results ? screenshotsData.results.map(s => s.image) : []
    };

    return res.status(200).json(fullGameData);

  } catch (error) {
    console.error("Ошибка на сервере:", error);
    return res.status(500).json({ error: "Ошибка при получении детальных данных игры" });
  }
}
