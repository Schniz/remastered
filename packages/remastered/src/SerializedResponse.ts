export function isSerializedResponse(x: any): x is SerializedResponse {
  return "@remastered/serialized-response" in x;
}

export type SerializedResponse = {
  "@remastered/serialized-response": true;
  body: number[];
  headers: [string, string][];
  url?: string;
  status: number;
};

export async function serializeResponse(
  response: Response
): Promise<SerializedResponse> {
  const body = await response.arrayBuffer();
  return {
    "@remastered/serialized-response": true,
    headers: [...response.headers],
    body: [...new Uint8Array(body)],
    url: response.url,
    status: response.status,
  };
}

export function deserializeResponse(serialized: SerializedResponse): Response {
  const body = new Uint8Array(serialized.body);
  return new Response(body, {
    headers: serialized.headers,
    status: serialized.status,
  });
}
