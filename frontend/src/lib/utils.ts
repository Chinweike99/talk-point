
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs))
};

export const formatDate = (date: string | Date) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()

  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  
  return d.toLocaleDateString()
}

export const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
}


