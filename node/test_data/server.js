import express from 'express';
import { faker } from '@faker-js/faker/locale/en_US';

const app = express();

app.get('/test-data/first-name', (req, res) => {
  const gender = req.query.gender;
  let firstName;
  if (gender === 'male') {
    firstName = faker.person.firstName('male'); 
  } else if (gender === 'female') {
    firstName = faker.person.firstName('female'); 
  } else {
    firstName = faker.person.firstName(); 
  }
  res.send(firstName);
});

app.get('/test-data/last-name', (req, res) => {
  const lastName = faker.person.lastName();
  res.send(lastName);
});

app.get('/test-data/address', (req, res) => {
  const state = req.query.state;
  let address;
  if (state) {
    let zc = faker.location.zipCode({ state: state })
    address = {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: state.toUpperCase(),
      zip: zc,
      completeAddress: `${faker.location.streetAddress()}, ${faker.location.city()}, ${state.toUpperCase()} ${zc}`
    };
  } else {
    address = {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.stateAbbr(),
      zip: faker.location.zipCode(),
      completeAddress: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.stateAbbr()} ${faker.location.zipCode()}`
    };
  }
  res.json(address);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});