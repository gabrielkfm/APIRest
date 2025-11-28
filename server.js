require('dotenv').config();

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || './SQLite.db';

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error(err.message);
  }
});

app.get('/', (req, res) => {
  res.send('API de Filmes rodando!');
});

app.get('/movies', (req, res) => {
  db.all('SELECT * FROM movies', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.get('/movies/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM movies WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: 'Filme não encontrado' });
    }

    res.json(row);
  });
});

app.post('/movies', (req, res) => {
  const { title, director, year, watched } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Título obrigatório' });
  }

  db.run(
    'INSERT INTO movies (title, director, year, watched) VALUES (?, ?, ?, ?)',
    [title, director, year, watched ?? 0],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        id: this.lastID,
        title,
        director,
        year,
        watched
      });
    }
  );
});

app.put('/movies/:id', (req, res) => {
  const { id } = req.params;
  const { title, director, year, watched } = req.body;

  db.run(
    'UPDATE movies SET title = ?, director = ?, year = ?, watched = ? WHERE id = ?',
    [title, director, year, watched, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Filme não encontrado' });
      }

      res.json({ message: 'Filme atualizado' });
    }
  );
});

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params;

  db.run(
    'DELETE FROM movies WHERE id = ?',
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Filme não encontrado' });
      }

      res.json({ message: 'Filme removido' });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
