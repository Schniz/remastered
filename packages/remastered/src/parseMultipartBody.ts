import Busboy from "busboy";
import { HttpRequest } from "./HttpTypes";

/**
 * Parse a `multipart/form-data` request.
 * This allows sending a file attachment with a form, to upload files.
 */
export async function parseMultipartBody(
  request: HttpRequest
): Promise<RemasteredFormData> {
  const contentType = request.headers.get("Content-Type");
  if (!contentType?.toLowerCase().trim().startsWith("multipart/form-data")) {
    throw new Error(
      "Content type is not allowed. Please pass multipart/form-data"
    );
  }
  const response = await parse({
    contentType,
    body: Buffer.from(await request.arrayBuffer()),
  });
  return response;
}

export type FileInfo = {
  fileName: string;
  contentType: string;
  encoding: string;
  content: Buffer;
};

type FormDataishValue = FileInfo | string;

/**
 * This class emulates `FormData`.
 *
 * I thought about using `form-data` but it meant for constructing multipart forms and not for reading them. So I guess that there is some overhead of using it.
 * All I want is a simple Map!
 */
class RemasteredFormData {
  private readonly map = new Map<string, FormDataishValue[]>();

  *[Symbol.iterator](): IterableIterator<[string, FormDataishValue[]]> {
    yield* this.map.entries();
  }

  entries(): IterableIterator<[string, FormDataishValue[]]> {
    return this[Symbol.iterator]();
  }

  get(key: string): FormDataishValue | undefined {
    return this.map.get(key)?.[0];
  }

  set(key: string, value: FormDataishValue): void {
    this.map.set(key, [value]);
  }

  append(key: string, value: FormDataishValue): void {
    this.map.set(key, [...(this.map.get(key) ?? []), value]);
  }

  /** Get the first item of a given key if it is a field (not a file) */
  getField(key: string): string | undefined {
    const value = this.get(key);
    if (typeof value === "string") {
      return value;
    }
  }

  /** Get the first item of a given key if it is a file */
  getFile(key: string): FormDataishValue | undefined {
    const value = this.get(key);
    if (typeof value !== "string") {
      return value;
    }
  }

  getAll(key: string): FormDataishValue[] {
    return this.map.get(key) ?? [];
  }

  keys(): IterableIterator<string> {
    return this.map.keys();
  }

  /**
   * Returns all the files in a [string, FileInfo] pair.
   * If a key has two files attached to it, it will be emitted
   * twice.
   */
  *files(): IterableIterator<[string, FileInfo]> {
    for (const [key, value] of this) {
      for (const maybeFile of value) {
        if (typeof maybeFile !== "string") {
          yield [key, maybeFile];
        }
      }
    }
  }

  /**
   * Returns all the fields in a [string, string] pair.
   * If a key has two values attached to it, it will be emitted
   * twice.
   */
  *fields(): IterableIterator<[string, string]> {
    for (const [key, value] of this) {
      for (const maybeFile of value) {
        if (typeof maybeFile === "string") {
          yield [key, maybeFile];
        }
      }
    }
  }
}

/**
 * Parse a multipart request.
 * This should be exposed as a `parseMultipart(request)` function
 * so people won't have to hassle with the values here.
 *
 * @returns An object similar to FormData but not entirely equal to one.
 */
function parse({
  contentType,
  body,
}: {
  contentType: string;
  body: Buffer;
}): Promise<RemasteredFormData> {
  // mostly taken from https://github.com/francismeynard/lambda-multipart-parser/blob/master/index.js
  // but using the FormDataish constructor
  return new Promise((resolve, reject) => {
    const formData = new RemasteredFormData();
    const busboy = new Busboy({
      headers: {
        "content-type": contentType,
      },
    });

    busboy.on("file", (fieldName, file, fileName, encoding, contentType) => {
      let content: Buffer | undefined = undefined;

      file.on("data", (data) => {
        content = data;
      });

      file.on("end", () => {
        if (content) {
          formData.append(fieldName, {
            contentType,
            encoding,
            content,
            fileName,
          });
        }
      });
    });

    busboy.on("field", (fieldname, value) => {
      formData.append(fieldname, value);
    });

    busboy.on("error", (error: unknown) => {
      reject(error);
    });

    busboy.on("finish", () => {
      resolve(formData);
    });

    busboy.write(body);
    busboy.end();
  });
}
