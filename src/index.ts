import axios, { AxiosInstance } from 'axios';
import jwtDecode from 'jwt-decode';
import { TypedEmitter } from 'tiny-typed-emitter';
import fs from 'fs';
import FormData from 'form-data';
import concatBuffer from './functions/concatBuffer';

interface MomoSalaryEvent {
  ready: () => any;
  error: (error: Error) => any;
}

type Config = {
  username: string;
  password: string;
  mode?: 'test' | 'prod';
};

type DeliveryFile = {
  createdAt: string;
  fileId: string;
  fileName: string;
  partnerId: string;
};

type DeliveryItem = {
  phoneNumber: string;
  fullName: string;
  idNumber: string;
  extra: string;
  status: DeliveryStatus;
  statusName: string;
  lastUpdated: string;
  fileId: string;
};

type PayoutFile = {
  createdAt: string;
  fileId: string;
  fileName: string;
  name: string;
  partnerId: string;
  status: PayoutStatus;
  statusName: string;
  totalAmount: number;
  totalCheckAmount: number;
  totalCheckRequest: number;
  totalPayoutAmount: number;
  totalPayoutRequest: number;
  totalRequest: number;
  userCreatedName: string;
};

type PayoutItem = {
  amount: number;
  coreId: number;
  extra: string;
  fileId: string;
  fullName: string;
  idNumber: string;
  lastUpdated: string;
  payoutStatus: number;
  phoneNumber: string;
  status: PayoutItemStatus;
  statusName: string;
};

export enum DeliveryStatus {
  /** Tất cả, */
  all = -1,
  /** Dữ liệu không hợp lệ */
  invalid = 1,
  /** Ví không thoả điều kiện */
  walled_invalid = 2,
  /** Ví không tòn tại */
  walled_not_found = 3,
  /** Có thể nhận tiền */
  valid = 4,
}

export enum PayoutStatus {
  /** Tất cả */
  all = -1,
  /** Đã khởi tạo */
  new = 1, //
  /** Chờ duyệt */
  pending = 2,
  /** Đã chi */
  disbursed = 3,
  /** Từ chối chi */
  denied = 4,
  /** Đã huỷ */
  canceled = 5,
  /** Hết hạn */
  expired = 6,
}

export enum PayoutItemStatus {
  all = -1, // Tất cả
  /** Dữ liệu không hợp lệ */
  invalid = 1,
  /** Ví không thoả điều kiện */
  walled_invalid = 2,
  /** Ví không tòn tại */
  walled_not_found = 3,
  /** Có thể nhận tiền */
  valid = 4,
  /** Không thuốc danh sách người nhận */
  delivery_not_found = 5,
}

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
      },
      data: JSON.stringify({ requestId: Date.now() }),
    });
    return result.data.data.amount;
  }

  async getAllDeliveryFiles() {
    const result = await this._api({
      method: 'post',
      url: '/api/services/salary/v1/delivery/file',
      headers: {
        ...(await this.tokenHeader()),
      },
      data: JSON.stringify({ requestId: Date.now() }),
    });
    return result.data.data as DeliveryFile[];
  }

  async getAllDeliveryList(params: {
    fileId: string;
    status?: DeliveryStatus;
    idNumber?: string;
    phoneNumber?: string;
    page?: number;
    size?: number;
  }) {
    const {
      fileId,
      status = -1,
      idNumber = '',
      phoneNumber = '',
      page = 1,
      size = 10,
    } = params;
    const result = await this._api({
      method: 'post',
      url: '/api/services/salary/v1/delivery/list',
      headers: {
        ...(await this.tokenHeader()),
      },
      data: JSON.stringify({
        requestId: Date.now(),
        fileId,
        status,
        idNumber,
        phoneNumber,
        page,
        size,
      }),
    });
    return result.data.data as DeliveryItem[];
  }

  /**
   * Upload file danh sách người nhận
   * @param file path của file danh sách người nhận
   * @param name Tên file được lưu lại
   * @returns Trả về fileId
   */
  async uploadDeliveryList(file: string, name: string) {
    var data = new FormData();
    data.append('requestId', Date.now());
    data.append('file', fs.createReadStream(file), name);
    const concatenated = await concatBuffer(data);

    return await this._api({
      method: 'post',
      url: `/api/services/salary/v1/delivery/upload`,
      headers: {
        ...(await this.tokenHeader()),
        ...data.getHeaders(),
      },
      data: concatenated,
    }).then(
      res =>
        res.data.data as { fileId: string; total: number; totalSuccess: number }
    );
  }

  /**
   * Kiểm tra trạng thái upload danh sách người nhận
   * @param fileId Id file
   * @returns resultCode = 0 là thành công
   */
  async getDeliveryFileStatus(fileId: string) {
    const result = await this._api({
      method: 'get',
      url: '/api/services/salary/v1/delivery/status',
      params: { fileId },
      headers: {
        ...(await this.tokenHeader()),
      },
    });
    return result.data as {
      localMessage: string;
      message: string;
      referenceId: string;
      resultCode: number;
      uiMessage: string;
    };
  }

  /**
   * Tải file báo cáo danh sách người nhận
   */
  async getDeliveryListReport(params: {
    fileId: string;
    idNumber?: string;
    phoneNumber?: string;
    status?: DeliveryStatus;
  }) {
    const { fileId, idNumber = '', phoneNumber = '', status = -1 } = params;
    const result = await this._api({
      method: 'post',
      url: '/api/services/salary/v1/delivery/list/report/excel',
      headers: {
        ...(await this.tokenHeader()),
      },
      data: JSON.stringify({
        fileId,
        idNumber,
        phoneNumber,
        status,
      }),
    });
    return result.data.fileUrl as string;
  }

  /**
   * Kiểm tra lại trạng thái ví của dữ liệu
   * @param fileId Mã file
   */
  async recheckDeliveryList(fileId: string) {
    const result = await this._api({
      method: 'post',
      url: '/api/services/salary/v1/delivery/recheck',
      headers: {
        ...(await this.tokenHeader()),
      },
      data: JSON.stringify({
        fileId,
        requestId: Date.now(),
      }),
    });
    return result.data.localMessage as string;
  }

  /**
   * Upload file danh sách giải ngân
   * @param file path của file danh sách giải ngân
   * @param name Tên file được lưu lại
   * @returns Trả về fileId
   */
  async uploadPayoutList(file: string, name: string) {
    var data = new FormData();
    data.append('requestId', Date.now());
    data.append('file', fs.createReadStream(file));
    data.append('name', name);
    const concatenated = await concatBuffer(data);

    return await this._api({
      method: 'post',
      url: `/api/services/salary/v1/payout/upload`,
      headers: {
        ...(await this.tokenHeader()),
        ...data.getHeaders(),
      },
      data: concatenated,
    }).then(
      res =>
        res.data.data as { fileId: string; total: number; totalSuccess: number }
    );
  }

  /**
   * Kiểm tra trạng thái upload danh sách giải ngân
   * @param fileId Id file
   * @returns resultCode = 0 là thành công
   */
  async getPayoutFileStatus(fileId: string) {
    const result = await this._api({
      method: 'get',
      url: '/api/services/salary/v1/payout/status',
      params: { fileId },
      headers: {
        ...(await this.tokenHeader()),
      },
    });
    return result.data as {
      localMessage: string;
      message: string;
      referenceId: string;
      resultCode: number;
      uiMessage: string;
    };
  }

  /**
   * Láy danh sách đợt giải ngân
   */
  async getAllPayoutFiles(params: {
    fromDate: string;
    toDate: string;
    page?: number;
    size?: number;
    status?: PayoutStatus;
  }) {
    const { fromDate, toDate, page = 1, size = 10, status = -1 } = params;
    const result = await this._api({
      method: 'post',
      url: '/api/services/salary/v1/payout/file',
      headers: {
        ...(await this.tokenHeader()),
      },
      data: JSON.stringify({
        requestId: Date.now(),
        fromDate,
        toDate,
        page,
        size,
        status,
      }),
    });
    return result.data.data as PayoutFile[];
  }

  /**
   * Tải file báo cáo danh sách người nhận
   */
  async getPayoutListReport(fileId: string) {
    const result = await this._api({
      method: 'post',
      url: '/api/services/salary/v1/payout/list/report/excel',
      headers: {
        ...(await this.tokenHeader()),
      },
      data: JSON.stringify({
        requestId: Date.now(),
        fileId,
      }),
    });
    return result.data.fileUrl as string;
  }

  /** Láy chi tiết thông tin đợt giải ngân */
  async getPayoutFileDetail(fileId: string) {
    const result = await this._api({
      method: 'post',
      url: '/api/services/salary/v1/payout/file/detail',
      headers: {
        ...(await this.tokenHeader()),
      },
      data: JSON.stringify({
        requestId: Date.now(),
        fileId,
      }),
    });
    return result.data.data as PayoutFile;
  }

  async getPayoutList(params: {
    fileId: string;
    page?: number;
    size?: number;
    status?: PayoutItemStatus;
    coreId?: string;
    phoneNumber?: string;
    payoutStatus?: number;
  }) {
    const {
      fileId,
      page = 1,
      size = 10,
      status = -1,
      coreId = '',
      phoneNumber = '',
      payoutStatus = -1,
    } = params;

    const result = await this._api({
      method: 'post',
      url: '/api/services/salary/v1/payout/list',
      headers: {
        ...(await this.tokenHeader()),
      },
      data: JSON.stringify({
        requestId: Date.now(),
        fileId,
        page,
        size,
        status,
        coreId,
        phoneNumber,
        payoutStatus,
      }),
    });
    return result.data.data as PayoutItem[];
  }
}
