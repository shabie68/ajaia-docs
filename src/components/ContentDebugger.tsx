// 'use client';

// interface ContentDebuggerProps {
//   content: string;
//   documentId: string;
// }


// export default function ContentDebugger({ content, documentId }: ContentDebuggerProps) {
//   return (
//     <div className="border border-red-500 p-4 mb-4 rounded">
//       <h3 className="text-red-600 font-bold mb-2">Content Debugger</h3>
//       <p className="text-sm text-gray-600 mb-2">Document ID: {documentId}</p>
//       <p className="text-sm text-gray-600 mb-2">Content Type: {typeof content}</p>
//       <p className="text-sm text-gray-600 mb-2">Content Length: {content.length}</p>
//       <p className="text-sm text-gray-600 mb-2">Content Preview:</p>
//       <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
//         {JSON.stringify(content, null, 2)}
//       </pre>
//     </div>
//   );
// }