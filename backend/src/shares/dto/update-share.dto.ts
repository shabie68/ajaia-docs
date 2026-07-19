export class UpdateShareDto {
  documentId: string;
  userEmail: string;
  permission: 'view' | 'edit';
}