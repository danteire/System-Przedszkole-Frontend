
export interface AnnouncementDTO {
  id: number;           // Long -> number
  title: string;
  content: string;
  publishedAt: string;  // LocalDateTime -> string (ISO 8601)
  authorId: number;     // Long -> number
  groupId: number | null; // Long -> number (zakładam null dla "wszystkich")
}