import axios, { AxiosInstance } from 'axios';
import jwtDecode from 'jwt-decode';
import { TypedEmitter } from 'tiny-typed-emitter';

interface MomoSalaryEvent {
  ready: () => any;
  error: (error: Error) => any;
}

type Config = {
  username: string;
  password: string;
  mode?: 'test' | 'prod';
};

export default class MomoSalary extends TypedEmitter<MomoSalaryEvent> {
  private _api: AxiosInstance;
  private _token: string = '';
  private _tokenExpired: Date = new Date();

  isReady: boolean = false;

  constructor(private _cfg: Config) {
    super();
    const { mode = 'prod' } = this._cfg;
    this._api = axios.create({
      baseURL:
        mode == 'test'
          ? 'https://test-business.momo.vn'
          : 'https://business.momo.vn',
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    });
    this._api.interceptors.response.use(
      response => response,
      error => {
        if (error?.response?.data?.error)
          if (error?.response?.data?.error.message) {
            throw Error(error?.response?.data?.error.message);
          } else {
            throw Error(error?.response?.data?.error);
          }
        console.log('request', error.request);
        throw error;
      }
    );
    this.getToken();
  }
  private async tokenHeader() {
    if (!this._token || this._tokenExpired < new Date()) {
      await this.getToken();
    }
    return {
      authorization: `Bearer ${this._token}`,
    };
  }

  private async getToken() {
    try {
      const result = await this._api.post('/api/authentication/login', {
        username: this._cfg.username,
        password: this._cfg.password,
      });
      this._token = result.data.data.token;
      const decodedToken: any = jwtDecode(this._token);
      this._tokenExpired = new Date(decodedToken.exp * 1000);
      this.isReady = true;
      this.emit('ready');
    } catch (err) {
      this.emit('error', err as any);
      throw err;
    }
  }

  async getBalance() {
    const result = await this._api({
      method: 'post',
      url: '/api/services/salary/v1/balance',
      headers: {
        ...(await this.tokenHeader()),
        Referer:
          'https://test-business.momo.vn/v2/portal/salary/payout-management',
        'Content-Type': 'application/json;charset=UTF-8',
      },
      data: JSON.stringify({ requestId: Date.now() }),
    });
    return result.data.data.amount;
  }
}
