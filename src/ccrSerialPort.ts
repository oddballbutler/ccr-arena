import { SerialPort } from "serialport";

export interface PortInfo {
  path: string;
  manufacturer: string | undefined;
  serialNumber: string | undefined;
  pnpId: string | undefined;
  locationId: string | undefined;
  productId: string | undefined;
  vendorId: string | undefined;
}

export interface CCRSerialPort {
  port: SerialPort | undefined;
  info: PortInfo | undefined;
}

let ccrSerialPort: CCRSerialPort;

async function init() {
  const _serialPort: CCRSerialPort = { port: undefined, info: undefined };
  _serialPort.info = (await SerialPort.list()).find((portInfo: PortInfo) =>
    portInfo ? /arduino/i.test(portInfo.manufacturer!) : false
  );

  if (_serialPort.info) {
    const port = new SerialPort({
      path: _serialPort.info.path,
      baudRate: 9600,
      autoOpen: true,
    });
  }

  ccrSerialPort = _serialPort;
}

export async function getSerialPort() {
  if (!ccrSerialPort) {
    await init();
  }
  return ccrSerialPort;
}
