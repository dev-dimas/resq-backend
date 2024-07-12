import { RegisterAccountRequest } from 'src/model/account.model';

export const ACCOUNT_CUSTOMER_TEST: RegisterAccountRequest = {
  email: 'customer@gmail.com',
  name: 'Customer',
  password: 'testingtesting',
  asCustomer: true,
};

export const ACCOUNT_SELLER_TEST: RegisterAccountRequest = {
  email: 'seller@gmail.com',
  name: 'Seller',
  password: 'testingtesting',
  asCustomer: false,
};
