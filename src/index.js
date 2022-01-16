import express, { response } from 'express';
import { v4 as uuidV4 } from 'uuid';

const app = express();

app.use(express.json());

const customers = [];

// Middleware
function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find(
    (customer) => customer.cpf === cpf
  );

  if (!customer) {
    return response.status(400).json({ error: 'Customer not found' });
  }

  request.customer = customer;

  return next();
}

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === 'credit') {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
}

/**
 * id - uuid
 * cpf - string
 * name = string
 * statement - []
 */

app.post('/account', (request, response) => {
  const { cpf, name } = request.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlreadyExists) {
    return response.status(400).json({ error: 'Customer already exists!' });
  }

  const customer = {
    id: uuidV4(),
    cpf,
    name,
    statement: [],
  };

  customers.push(customer);

  return response.status(201).json(customers);
});

app.use(verifyIfExistsAccountCPF);

app.get('/account', (request, response) => {
  const { customer } = request;

  return response.status(200).json({ customer });
});

app.put('/account', (request, response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name;

  return response.status(201).json({ customer });
});

app.delete('/account', (request, response) => {
  const { customer } = request;

  customers.splice(customer, 1);

  return response.status(200).json(customers);
});

app.get('/statement', (request, response) => {
  const { customer } = request;

  return response.status(200).json(customer.statement);
});

app.get('/statement/date', (request, response) => {
  const { date } = request.query;
  const { customer } = request;

  const dateFormat = new Date(date + " 00:00");

  const statement = customer.statement.filter(
    (statement) =>
      statement.created_at.toDateString() === new Date(dateFormat).toDateString()
  );

  return response.status(200).json(statement);
});

app.post('/deposit', (request, response) => {
  const { amount, description } = request.body;
  const { customer } = request;

  const statementOperation = {
    amount,
    description,
    created_at: new Date(),
    type: 'credit',
  };

  customer.statement.push(statementOperation  );

  return response.status(200).json(customer.statement);
});

app.post('/withdraw', (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: 'Insufficient funds!' });
  }

  const statementOperation = {
    amount,
    description: 'saque',
    created_at: new Date(),
    type: 'withdraw',
  };

  customer.statement.push(statementOperation);

  return response.status(200).json(statementOperation);
});

app.get('/balance', (request, response) => {
  const { customer } = request;

  const balance = getBalance(customer.statement);

  return response.status(200).json({ balance });
});

app.listen(3333, () => {
  console.log('🚀 Server started on port 3333');
});
