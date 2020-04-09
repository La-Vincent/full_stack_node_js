const express = require('express');
const { v4: uuidv4 } = require('uuid');
const morgan = require('morgan');
const app = express();
const cors = require('cors');


morgan.token('body', function (req, res) {
	return JSON.stringify(req.body);
})

const logger = function (tokens, req, res) {
	return [
		tokens.method(req, res),
		tokens.url(req, res),
		tokens.status(req, res),
		tokens['response-time'](req, res), 'ms -',
		tokens.res(req, res, 'content-length'),
		tokens.body(req, res)
	].join(' ')
}

app.use(express.static('build'));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'))

const PORT = process.env.PORT || 3001;

const persons = [
	{
		name: 'Arto Hellas',
		number: '040-123456',
		id: '1'
	},
	{
		name: 'Ada Lovelace',
		number: '39-44-5323523',
		id: '2'
	},
	{
		name: 'Dan Abramov',
		number: '12-43-234345',
		id: '3'
	},
	{
		name: 'Mary Poppendieck',
		number: '39-23-6423122',
		id: '4'
	}
]

app.get('/', (req, res) => {
	res.send('Hello World');
})

app.get('/info', (req, res) => {
	res.send(`Phonebook has info for ${persons.length} people.<br><br>${new Date()}`)
})

app.get('/api/persons/:id', (req, res) => {
	const { id } = req.params;
	const person = persons.find(p => p.id === id)
	if (person) {
		res.json(person);
	} else {
		res.status(404).end();
	}
})

app.delete('/api/persons/:id', (req, res) => {
	const { id } = req.params;
	const personIndex = persons.findIndex(p => p.id === id)
	if (personIndex) {
		persons.splice(personIndex, 1);
		res.sendStatus(204).end();
	} else {
		res.sendStatus(404).end();
	}
})

app.put('/api/persons/:id', (req, res) => {
	const { name, number } = req.body;
	const existingIndex = persons.findIndex(p => p.name.toLowerCase() === name.toLowerCase())
	if (existingIndex) {
		const existingPerson = persons[existingIndex];
		const updatedPerson = {
			...existingPerson,
			name,
			number
		}
		persons[existingIndex] = updatedPerson;
		res.status(201).send(updatedPerson)
	} else {
		res.sendStatus(404);
	}
})

app.post('/api/persons', morgan(logger), (req, res) => {
	const { name, number } = req.body;
	const nameExist = persons.find(p => p.name.toLowerCase() === name.toLowerCase())
	if (nameExist) {
		res.status(409).send(res.json({ error: 'name must be unique' }));
	}
	if (!name) {
		res.status(422).send(res.json({ error: 'a name must be provided' }));
	}
	if (!number) {
		res.status(422).send(res.json({ error: 'a number must be provided' }));
	}
	const person = {
		name,
		number,
		id: uuidv4()
	}
	persons.push(person);
	res.status(201).send(person);
})

app.get('/api/persons', (req, res) => {
	res.json(persons);
})

app.listen(PORT, () => console.log(`Example app listening at http://localhost:${PORT}`))