import express from 'express';
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
    statement: []
  };

  customers.push(customer);

  return response.status(201).json(customers);
});

app.use(verifyIfExistsAccountCPF);

app.get('/statement', (request, response) => {
  const { customer } = request;

  return response.status(200).json(customer.statement);
});

app.listen(3333, () => {
  console.log('🚀 Server started on port 3333');
});
