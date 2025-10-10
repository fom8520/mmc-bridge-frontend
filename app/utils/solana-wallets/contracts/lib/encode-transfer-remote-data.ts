function encodeU256(amount: bigint | number): Uint8Array {
  const num = BigInt(amount);
  const buf = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    buf[31 - i] = Number((num >> BigInt(i * 8)) & 0xffn);
  }
  return buf; //
}

export function encodeTransferRemote(
  destinationDomain: number,
  recipient: Uint8Array | string,
  amount: bigint | number,
): Uint8Array {
  const recipientBytes = typeof recipient === 'string'
    ? hexToBytes(recipient)
    : recipient;

  if (recipientBytes.length !== 32) {
    throw new Error('Recipient must be 32 bytes');
  }

  const writer: number[] = [];

  // ✅ tag = 1
  writer.push(1);

  // ✅ destination_domain: u32 (小端)
  writer.push(destinationDomain & 0xff);
  writer.push((destinationDomain >> 8) & 0xff);
  writer.push((destinationDomain >> 16) & 0xff);
  writer.push((destinationDomain >> 24) & 0xff);

  // ✅ recipient: H256 (32 bytes)
  for (const byte of recipientBytes) {
    writer.push(byte);
  }

  // ✅ amount_or_id: U256 (32 bytes, 大端)
  const u256Bytes = encodeU256(amount);
  for (const byte of u256Bytes) {
    writer.push(byte);
  }

  return new Uint8Array(writer);
}

function hexToBytes(hex: string): Uint8Array {
  const cleaned = hex.startsWith('0x') ? hex.slice(2) : hex;
  const padded = cleaned.length % 2 === 0 ? cleaned : '0' + cleaned;
  const bytes = new Uint8Array(padded.length / 2);
  for (let i = 0; i < padded.length; i += 2) {
    bytes[i / 2] = parseInt(padded.substr(i, 2), 16);
  }
  return bytes;
}
