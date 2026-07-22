export class CreateDocumentDto {
  userId: string;
  title: string;
  content?: string; // ✅ Add this
}