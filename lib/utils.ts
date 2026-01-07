
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Tách dấu ra khỏi ký tự
    .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu
    .replace(/[đĐ]/g, 'd') // Xử lý chữ đ
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/[^\w\-]+/g, '') // Xóa ký tự đặc biệt
    .replace(/\-\-+/g, '-') // Thay thế nhiều dấu gạch ngang liên tiếp
    .replace(/^-+/, '') // Cắt dấu gạch ngang đầu
    .replace(/-+$/, ''); // Cắt dấu gạch ngang cuối
}
