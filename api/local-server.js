import app from './index.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Local Express server running on http://localhost:${PORT}`);
  console.log(`API endpoints proxied from Vite frontend to port ${PORT}`);
});
