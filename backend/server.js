require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const authController = require('./src/controllers/authController');
const moviesController = require('./src/controllers/moviesController');
const favoritesController = require('./src/controllers/favoritesController');
const commentsController = require('./src/controllers/commentsController');
const authMiddleware = require('./src/middlewares/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

app.use('/api/*', authMiddleware);

app.get('/api/movies', moviesController.searchMovies);
app.get('/api/movies/:id/details', moviesController.getMovieDetails);

app.post('/api/favorites', favoritesController.addFavorite);
app.get('/api/favorites', favoritesController.listFavorites);
app.delete('/api/favorites/:id', favoritesController.removeFavorite);

app.post('/api/comments', commentsController.addComment);
app.get('/api/comments', commentsController.listComments);
app.delete('/api/comments/:id', commentsController.removeComment);

const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.json({ message: 'API Cine Mágico funcionando. O frontend está em outro container.' });
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Cine Mágico rodando na porta ${PORT}`);
});
