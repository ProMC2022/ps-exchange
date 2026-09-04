// api/games.js

export default async function handler(req, res) {
  try {
    // Сервер берет секретный ключ из переменных окружения Vercel
    const apiKey = process.env.NEXT_RAWG_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Переменная NEXT_RAWG_API_KEY не настроена в Vercel" });
    }

    // Собираем топ-100 на стороне сервера (5 страниц по 20 игр)
    let allGames = [];
    for (let page = 1; page <= 5; page++) {
      const response = await fetch(
        `https://rawg.io${apiKey}&platforms=187&ordering=-rating&page=${page}&page_size=20`
      );
      const data = await response.json();
      if (data.results) {
        allGames = [...allGames, ...data.results];
      }
    }

    // Отдаем на фронтенд чистый массив игр БЕЗ ключа
    return res.status(200).json(allGames);
  } catch (error) {
    console.error("Ошибка на сервере:", error);
    return res.status(500).json({ error: "Ошибка при получении данных от RAWG API" });
  }
}
