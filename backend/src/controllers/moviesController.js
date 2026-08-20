const movies = [
  {
    id: 1,
    title: 'A Viagem de Chihiro',
    overview: 'Uma menina entra em um mundo mágico e precisa salvar seus pais em uma jornada cheia de fantasia e coragem.',
    poster_path: '/cR0f1m9R0TnYbA7nMQfTI0w5Gb2.jpg',
    release_date: '2001-07-20',
    vote_average: 8.9,
    genre_ids: [16, 14, 12]
  },
  {
    id: 2,
    title: 'O Rei Leão',
    overview: 'Na savana africana, um jovem leão precisa aceitar seu destino e proteger seu reino.',
    poster_path: '/4D9nZ4wXj8z3y9yTg9A1t4d5m5A.jpg',
    release_date: '1994-06-15',
    vote_average: 8.5,
    genre_ids: [16, 12, 18]
  },
  {
    id: 3,
    title: 'Harry Potter e a Pedra Filosofal',
    overview: 'Um menino descobre que é um bruxo e começa uma aventura escolar repleta de mistério e magia.',
    poster_path: '/jSVlW3B4M0lF7CkY2a5Yk0mV8aR.jpg',
    release_date: '2001-11-04',
    vote_average: 8.1,
    genre_ids: [12, 14, 10751]
  },
  {
    id: 4,
    title: 'Spirited Away',
    overview: 'Uma aventura de fantasia visualmente rica sobre coragem, amizade e autodescoberta.',
    poster_path: '/39xVe2iCq4EwL0X2E6d9L5OqVYh.jpg',
    release_date: '2001-07-20',
    vote_average: 8.9,
    genre_ids: [16, 14]
  },
  {
    id: 5,
    title: 'A Bela e a Fera',
    overview: 'Uma biblioteca e um castelo encantado abrigam uma história de amor e transformação.',
    poster_path: '/6pbP4n9HZl8nXYj0wRZlc4Yt3x7.jpg',
    release_date: '1991-11-13',
    vote_average: 8.2,
    genre_ids: [16, 10749, 14]
  },
  {
    id: 6,
    title: 'Frozen: Uma Aventura Congelante',
    overview: 'Irmãs com poderes mágicos embarcam em uma jornada para salvar seu reino do gelo.',
    poster_path: '/2Jv1Q6m2Yt9n03WkR5A8mU7mYkK.jpg',
    release_date: '2013-11-27',
    vote_average: 7.8,
    genre_ids: [16, 12, 10751]
  }
];

exports.searchMovies = async (req, res) => {
  try {
    const { q } = req.query;
    const filtered = !q
      ? movies
      : movies.filter((movie) => movie.title.toLowerCase().includes(q.toLowerCase()));

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar filmes' });
  }
};

exports.getMovieDetails = async (req, res) => {
  const { id } = req.params;
  const found = movies.find((movie) => movie.id === Number(id));

  if (!found) {
    return res.status(404).json({ error: 'Filme não encontrado' });
  }

  return res.json(found);
};
