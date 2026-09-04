// api/game.js

export default async function handler(req, res) {
  try {
    // Берем ваш рабочий ключ из настроек Vercel
    const apiKey = process.env.NEXT_RAWG_API_KEY;
    
    // Получаем ID игры из запроса (например: /api/game?id=3328)
    const { id } = req.query;

    if (!apiKey) {
      return res.status(500).json({ error: "Переменная NEXT_RAWG_API_KEY не настроена" });
    }

    if (!id) {
      return res.status(400).json({ error: "Не указан ID игры" });
    }

    // 1. Запрашиваем основную детальную информацию об игре (описание, издателей)
    const mainResponse = await fetch(`https://rawg.io{id}?key=${apiKey}`);
    const mainData = await mainResponse.json();

    // 2. Параллельно запрашиваем скриншоты для будущей галереи этой игры
    const screenshotsResponse = await fetch(`https://rawg.io{id}/screenshots?key=${apiKey}`);
    const screenshotsData = await screenshotsResponse.json();

    // Собираем всё в один аккуратный объект без лишнего мусора
    const fullGameData = {
      id: mainData.id,
      name: mainData.name,
      description: mainData.description_raw || mainData.description, // Текст без HTML-тегов
      background_image: mainData.background_image,
      rating: mainData.rating,
      released: mainData.released,
      metacritic: mainData.metacritic,
      developers: mainData.developers?.map(d => d.name) || [],
      genres: mainData.genres?.map(g => g.name) || [],
      screenshots: screenshotsData.results?.map(s => s.image) || [] // Массив ссылок на скриншоты
    };

    // Отдаем полные данные на фронтенд
    return res.status(200).json(fullGameData);
  } catch (error) {
    console.error("Ошибка на сервере при запросе игры:", error);
    return res.status(500).json({ error: "Ошибка при получении детальных данных игры" });
  }
}
