import { Injectable, Logger } from '@nestjs/common';
import {
  IDeviceConnector,
  IDeviceConnectorFactory,
} from '@app/domain';
import { ZKTecoAdapter } from './adapters/zteco.adapter';
import { PPAAdapter } from './adapters/ppa.adapter';
import { ImecontronAdapter } from './adapters/imecontron.adapter';
import { MockAdapter } from './adapters/mock.adapter';

@Injectable()
export class DeviceConnectorFactory implements IDeviceConnectorFactory {
  private readonly logger = new Logger(DeviceConnectorFactory.name);

  constructor() {
    // TODO: Injetar SDKs específicos (ex: ZKTecoSDK) se necessário
  }

  createConnector(driverName: string): IDeviceConnector {
    this.logger.log(`Criando instância do driver: [${driverName}]`);

    switch (driverName) {
      case 'ZKTecoAdapter':
        return new ZKTecoAdapter();
      
      case 'PPAAdapter':
        return new PPAAdapter();

      case 'ImecontronAdapter':
        return new ImecontronAdapter();
      
      case 'MockAdapter':
        return new MockAdapter();

      default:
        this.logger.error(`Driver [${driverName}] não suportado.`);
        throw new Error(`Driver [${driverName}] não suportado.`);
    }
  }
}