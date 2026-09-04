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

    // 1. ЗАПРОС ОСНОВНЫХ ДАННЫХ ИГРЫ
    const urlMain = "https://api.rawg.io/api/games/" + id + "?key=" + apiKey;
    const mainResponse = await fetch(urlMain);
    
    if (!mainResponse.ok) {
      return res.status(mainResponse.status).json({ 
        error: "RAWG API вернул ошибку " + mainResponse.status + " для игры ID " + id 
      });
    }
    
    const mainData = await mainResponse.json();

    // 2. ИЗОЛИРОВАННЫЙ БЕЗОПАСНЫЙ ЗАПРОС СКРИНШОТОВ (Оборачиваем в отдельный try-catch)
    let screenshots = [];
    try {
      const urlScreens = "https://api.rawg.io/api/games/" + id + "/screenshots?key=" + apiKey;
      const screenshotsResponse = await fetch(urlScreens);
      
      if (screenshotsResponse.ok) {
        const screenshotsData = await screenshotsResponse.json();
        if (screenshotsData.results) {
          screenshots = screenshotsData.results.map(s => s.image);
        }
      }
    } catch (screenError) {
      console.error("Не удалось догрузить скриншоты:", screenError);
      // Не падаем, массив screenshots просто остается пустым []
    }

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
      screenshots: screenshots // Подставится либо массив картинок, либо пустой []
    };

    return res.status(200).json(fullGameData);

  } catch (error) {
    console.error("Глобальная ошибка на сервере:", error);
    return res.status(500).json({ error: "Глобальный сбой сервера при сборке данных" });
  }
}
