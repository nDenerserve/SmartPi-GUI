export class CTType {
  1: string;
  2: string;
  3: string;
  4: string;
}

export class CTTypePrimaryCurrent {
  1: number;
  2: number;
  3: number;
  4: number;
}

export class CurrentDirection {
  1: boolean;
  2: boolean;
  3: boolean;
  4: boolean;
}

export class MeasureCurrent {
  1: boolean;
  2: boolean;
  3: boolean;
  4: boolean;
}

export class MeasureVoltage {
  1: boolean;
  2: boolean;
  3: boolean;
}

export class Voltage {
  1: number;
  2: number;
  3: number;
}

export class CalibrationfactorI {
  1: number;
  2: number;
  3: number;
  4: number;
}

export class CalibrationfactorU {
  1: number;
  2: number;
  3: number;
}

export class GUIMaxCurrent {
  1: number;
  2: number;
  3: number;
  4: number;
}

export class Settings {
  Serial: string;
  Name: string;
  LogLevel: string;
  DebugLevel: number;
  MetricsListenAddress: string;
  Lat: number;
  Lng: number;
  CounterEnabled: boolean;
  CounterDir: string;
  DatabaseEnabled: boolean;
  SQLLiteEnabled: boolean;
  DatabaseDir: string;
  Influxuser: string;
  Influxpassword: string;
  Influxdatabase: string;
  I2CDevice: string;
  PowerFrequency: number;
  Samplerate: number;
  Integrator: boolean;
  CTType: {
    [key: number]: CTType;
  };
  CTTypePrimaryCurrent: {
    [key: number]: CTTypePrimaryCurrent;
  };
  CurrentDirection: {
    [key: number]: CurrentDirection;
  };
  MeasureCurrent: {
    [key: number]: MeasureCurrent;
  };
  MeasureVoltage: {
    [key: number]: MeasureVoltage;
  };
  Voltage: {
    [key: number]: Voltage;
  };
  FTPupload: boolean;
  FTPserver: string;
  FTPuser: string;
  FTPpass: string;
  FTPpath: string;
  FTPcsv: boolean;
  FTPxml: boolean;
  FTPsendtimes: boolean[];
  SharedFileEnabled: boolean;
  SharedDir: string;
  SharedFile: string;
  WebserverPort: number;
  DocRoot: string;
  AppKey: string;
  CSVdecimalpoint: string;
  CSVtimeformat: string;
  MQTTenabled: boolean;
  MQTTbroker: string;
  MQTTbrokerport: string;
  MQTTuser: string;
  MQTTpass: string;
  MQTTtopic: string;
  ModbusRTUenabled: boolean;
  ModbusTCPenabled: boolean;
  ModbusRTUAddress: number;
  ModbusRTUDevice: string;
  ModbusTCPAddress: string;
  MobileEnabled: boolean;
  MobileAPN: string;
  MobilePIN: string;
  MobileUser: string;
  MobilePass: string;
  CalibrationfactorI: {
    [key: number]: CalibrationfactorI;
  };
  CalibrationfactorU: {
    [key: number]: CalibrationfactorU;
  };
  GUIMaxCurrent: {
    [key: number]: GUIMaxCurrent;
  };
}

// export class Settings {
//   CSVdecimalpoint: string;
//   CSVtimeformat: string;
//   CTType: string[];
//   CTTypePrimaryCurrent: number[];
//   CounterDir: string;
//   CounterEnabled: boolean;
//   CurrentDirection: boolean[];
//   DatabaseDir: string;
//   DatabaseEnabled: boolean;
//   DebugLevel: number;
//   DocRoot: string;
//   FTPcsv: boolean;
//   FTPpass: string;
//   FTPpath: string;
//   FTPserver: string;
//   FTPupload: boolean;
//   FTPuser: string;
//   FTPxml: boolean;
//   I2CDevice: string;
//   Lat: number;
//   Lng: number;
//   LogLevel: string;
//   MQTTbroker: string;
//   MQTTbrokerport: string;
//   MQTTenabled: boolean;
//   MQTTpass: string;
//   MQTTtopic: string;
//   MQTTuser: string;
//   MeasureCurrent: boolean[];
//   MeasureVoltage: boolean[];
//   MetricsListenAddress: string;
//   MobileAPN: string;
//   MobileEnabled: boolean;
//   MobilePIN: string;
//   MobilePass: string;
//   MobileUser: string;
//   ModbusRTUAddress: number;
//   ModbusRTUDevice: string;
//   ModbusRTUenabled: false;
//   ModbusTCPAddress: string;
//   ModbusTCPenabled: boolean;
//   Name: string;
//   PowerFrequency: number;
//   Serial: string;
//   SharedDir: string;
//   SharedFile: string;
//   SharedFileEnabled: boolean;
//   Voltage: number[];
//   WebserverPort: number;
// }
