const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static('public'));

async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return { transactions: [] };
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/transactions', async (req, res) => {
  const data = await readData();
  res.json(data);
});

app.post('/api/transactions', async (req, res) => {
  const data = await readData();
  const transaction = {
    id: Date.now().toString(),
    person: req.body.person,
    amount: parseFloat(req.body.amount),
    description: req.body.description,
    date: new Date().toISOString()
  };
  data.transactions.push(transaction);
  await writeData(data);
  res.json(transaction);
});

app.delete('/api/transactions/:id', async (req, res) => {
  const data = await readData();
  data.transactions = data.transactions.filter(t => t.id !== req.params.id);
  await writeData(data);
  res.json({ success: true });
});

app.delete('/api/transactions', async (req, res) => {
  await writeData({ transactions: [] });
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
