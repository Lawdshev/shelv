import crypto from "crypto";
import path from "path";
import env from "../config/env";
// import * as factoryRepository from "../repository/factory";
import { format } from "date-fns";

export function firstCharToUpperCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function convertToSentenceCase(str: string): string {
  return str
    .split(" ")
    .map((word) => firstCharToUpperCase(word))
    .join(" ");
}

export function convertToSnakeCase(str: string): string {
  return str
    .split(" ")
    .map((word) => word.toLowerCase())
    .join("_");
}

export function sortDirection(direction: string): 1 | -1 | 0 {
  return !direction
    ? 0
    : direction.toLowerCase() === "asc"
    ? 1
    : direction.toLowerCase() === "desc"
    ? -1
    : 0;
}

export function generateRandomString(
  length: number,
  uppercase = false
): string {
  return uppercase
    ? crypto.randomBytes(length).toString("hex").toUpperCase()
    : crypto.randomBytes(length).toString("hex");
}

export function generateRandomNumberString(length: number): string {
  return Math.floor(
    Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
  ).toString();
}

export function renderTemplateString(
  template: string,
  data: Record<string, any>
): string {
  return template.replace(/{{([^}]+)}}/g, (_, key: string) => data[key]);
}

export function extractAttachments(attachments: Array<string>): Array<{
  filename: string;
  path: string;
}> {
  return attachments.map((attachment) => {
    return {
      filename: path.basename(attachment),
      path: attachment,
    };
  });
}

export function computeChecksum(payload: string): string {
  return crypto.createHash("sha256").update(payload).digest("hex");
}

// export const generateId = async (key: string): Promise<string> => {
//   if (!env.cursor.current) {
//     let cursor = await factoryRepository.getCursorForKey(key);
//     env.cursor.current = (cursor as any)[key];
//     env.cursor.pointer = (cursor as any)[key] - env.cursor.step;
//   }
//   if (env.cursor.pointer === env.cursor.current) {
//     let cursor = await factoryRepository.getCursorForKey(key);
//     env.cursor.current = (cursor as any)[key];
//     env.cursor.pointer = (cursor as any)[key] - env.cursor.step;
//   }
//   env.cursor.pointer += 1;
//   return `${key.toUpperCase()}${env.cursor.pointer
//     .toString()
//     .padStart(9, "0")}`;
// };

export const encrypt = (text: string): string => {
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(env.encryption.algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  // pad encrypted text with iv and key
  const partOne = encrypted
    .split("")
    .slice(0, encrypted.length / 2)
    .join("");
  const partTwo = encrypted
    .split("")
    .slice(encrypted.length / 2)
    .join("");
  return `${partOne}_${iv.toString("hex")}_${partTwo}_${key.toString("hex")}`;
};

export const decrypt = (text: string): string => {
  const parts = text.split("_");
  const iv = Buffer.from(parts[1], "hex");
  const key = Buffer.from(parts[3], "hex");
  const encrypted = `${parts[0]}${parts[2]}`;
  const decipher = crypto.createDecipheriv(env.encryption.algorithm, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

export const wait = (s: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, s * 1000);
  });
};

export function formatSpreadsheetNumberString(amount: string): number {
  return amount || amount === null
    ? parseFloat(amount.replace(/[^\d,.-]/g, "").replace(/,/g, ""))
    : 0;
}

export function formatMonoDate(date: string): string {
  const inputDate = new Date(date);
  return format(inputDate, "dd-MM-yyyy");
}

export function formatDate(inputDateString: string): string {
  const inputDate = new Date(inputDateString);
  return format(inputDate, "dd-MMM-yyyy"); // Using 'dd' for day, 'MMM' for short month name, 'yyyy' for year
}
