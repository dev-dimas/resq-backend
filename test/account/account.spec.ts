import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  LoginAccountRequest,
  RegisterAccountRequest,
} from 'src/model/account.model';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { ACCOUNT_CUSTOMER_TEST, ACCOUNT_SELLER_TEST } from '../test.env';
import { TestModule } from '../test.module';
import { AccountTestService } from './account-test.service';

describe('Account Controller', () => {
  let app: INestApplication;
  let accountService: AccountTestService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    accountService = app.get(AccountTestService);
  });

  describe('(Register Account) POST /api/account/register', () => {
    afterEach(async () => {
      await accountService.deleteCustomer();
      await accountService.deleteSeller();
    });

    it('should be able to register as customer', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/account/register')
        .send({
          email: ACCOUNT_CUSTOMER_TEST.email,
          name: ACCOUNT_CUSTOMER_TEST.name,
          password: ACCOUNT_CUSTOMER_TEST.password,
          asCustomer: ACCOUNT_CUSTOMER_TEST.asCustomer,
        } satisfies RegisterAccountRequest);

      const user = await accountService.getCustomer();
      expect(response.status).toBe(201);
      expect(user).toBeDefined();
      expect(user.isSeller).toBeFalsy();
    });

    it('should be able to register as seller', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/account/register')
        .send({
          email: ACCOUNT_SELLER_TEST.email,
          name: ACCOUNT_SELLER_TEST.name,
          password: ACCOUNT_SELLER_TEST.password,
          asCustomer: ACCOUNT_SELLER_TEST.asCustomer,
        } satisfies RegisterAccountRequest);

      const user = await accountService.getSeller();
      expect(response.status).toBe(201);
      expect(user).toBeDefined();
      expect(user.isSeller).toBeTruthy();
    });

    it('should be rejected if email is already used', async () => {
      await accountService.createCustomer();

      const response = await request(app.getHttpServer())
        .post('/api/account/register')
        .send({
          email: ACCOUNT_CUSTOMER_TEST.email,
          name: ACCOUNT_CUSTOMER_TEST.name,
          password: ACCOUNT_CUSTOMER_TEST.password,
          asCustomer: true,
        } satisfies RegisterAccountRequest);

      expect(response.status).toBe(409);
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/account/register')
        .send({
          email: '',
          name: '',
          password: '',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('(Login Account) POST /api/account/login', () => {
    beforeAll(async () => {
      await accountService.createCustomer();
    });

    afterAll(async () => {
      await accountService.deleteCustomer();
    });

    it('should able to login', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/account/login')
        .send({
          email: ACCOUNT_CUSTOMER_TEST.email,
          password: ACCOUNT_CUSTOMER_TEST.password,
        } satisfies LoginAccountRequest);

      expect(response.status).toBe(200);
      expect(response.body.data.token).toBeDefined();
    });

    it('should be rejected if credentials is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/account/login')
        .send({
          email: 'random@gmail.com',
          password: 'passwordrandom',
        } satisfies LoginAccountRequest);

      expect(response.status).toBe(403);
    });
  });

  describe('(Logout Account) POST /api/account/logout', () => {
    let token: string;

    beforeAll(async () => {
      await accountService.createCustomer();
    });

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/account/login')
        .send({
          email: ACCOUNT_CUSTOMER_TEST.email,
          password: ACCOUNT_CUSTOMER_TEST.password,
        });
      token = response.body.data.token;
    });

    afterAll(async () => {
      await accountService.deleteCustomer();
    });

    it('should be able to logout', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/account/logout')
        .set({ authorization: token });

      const user = await accountService.getCustomer();

      expect(response.status).toBe(200);
      expect(user.token).toBeNull();
    });

    it('should be rejected if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/account/logout')
        .set({ authorization: 'invalidtoken' });

      const user = await accountService.getCustomer();

      expect(response.status).toBe(401);
      expect(user.token).toBe(token);
    });
  });
});
