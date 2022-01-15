import express from 'express';
import { v4 as uuidV4 } from 'uuid';

const app = express();

app.use(express.json());

const customers = [];

/**
 * id - uuid
 * cpf - string
 * name = string
 * statement - []
 */

app.post('/account', (request, response) => {
  const { cpf, name } = request.body;
  const id = uuidV4();

  const customer = {
    id,
    cpf,
    name,
    statement: []
  };

  customers.push(customer);

  return response.status(201).json(customers);
});

app.listen(3333, () => {
  console.log('🚀 Server started on port 3333');
});
