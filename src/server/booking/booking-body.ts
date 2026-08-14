import 'server-only';

export const BOOKING_BODY_LIMIT_BYTES = 8 * 1024;

export class BookingBodyTooLargeError extends Error {
  constructor() {
    super('Booking request body is too large.');
    this.name = 'BookingBodyTooLargeError';
  }
}

export class BookingInvalidJsonError extends Error {
  constructor() {
    super('Booking request body is not valid JSON.');
    this.name = 'BookingInvalidJsonError';
  }
}

export function isJsonContentType(value: string | null): boolean {
  return value !== null && /^application\/json(?:\s*;\s*charset\s*=\s*utf-8)?$/iu.test(value.trim());
}

export async function readJsonBody(
  request: Request,
  maxBytes: number = BOOKING_BODY_LIMIT_BYTES
): Promise<unknown> {
  const contentLength = request.headers.get('content-length');

  if (contentLength !== null) {
    const normalizedLength = contentLength.trim();

    if (/^\d+$/u.test(normalizedLength)) {
      const parsedLength = BigInt(normalizedLength);

      if (parsedLength > BigInt(maxBytes)) {
        throw new BookingBodyTooLargeError();
      }
    }
  }

  if (request.body === null) {
    throw new BookingInvalidJsonError();
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', {fatal: true});
  const chunks: string[] = [];
  let bytesRead = 0;

  try {
    while (true) {
      const {done, value} = await reader.read();

      if (done) {
        break;
      }

      bytesRead += value.byteLength;

      if (bytesRead > maxBytes) {
        throw new BookingBodyTooLargeError();
      }

      chunks.push(decoder.decode(value, {stream: true}));
    }

    chunks.push(decoder.decode());
  } catch (error) {
    if (error instanceof BookingBodyTooLargeError) {
      throw error;
    }

    throw new BookingInvalidJsonError();
  } finally {
    reader.releaseLock();
  }

  const text = chunks.join('');

  if (text.trim() === '') {
    throw new BookingInvalidJsonError();
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new BookingInvalidJsonError();
  }
}
