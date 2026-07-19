export class ShareDocumentDto {
  documentId: string;
  userEmail: string;
  permission: 'view' | 'edit';
}