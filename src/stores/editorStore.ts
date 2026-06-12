import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';
import type { Editor } from '@tiptap/vue-3';
import type { Document } from '@/types/document';
import {
  listDocuments,
  getDocument,
  createDocument,
  saveDocument,
  deleteDocument,
} from '@/services/storage/document';

export const useEditorStore = defineStore('editor', () => {
  // ========== State ==========
  const editor = shallowRef<Editor | null>(null);
  const documents = ref<Document[]>([]);
  const activeDocumentId = ref<string | null>(null);
  const documentTitle = ref('未命名文档');
  const isDirty = ref(false);

  // ========== Getters ==========
  const activeDocument = ref<Document | null>(null);

  // ========== Actions ==========
  function setEditor(instance: Editor | null) {
    editor.value = instance;
  }

  async function loadDocuments() {
    documents.value = await listDocuments();
  }

  async function openDocument(id: string) {
    const doc = await getDocument(id);
    if (doc) {
      activeDocumentId.value = id;
      activeDocument.value = doc;
      documentTitle.value = doc.title;
    }
  }

  async function newDocument() {
    const doc = await createDocument('未命名文档');
    activeDocumentId.value = doc.id;
    activeDocument.value = doc;
    documentTitle.value = doc.title;
    await loadDocuments();
    return doc;
  }

  async function saveCurrentDocument() {
    if (!activeDocumentId.value) return;
    const content = editor.value?.getHTML() ?? '';
    await saveDocument(activeDocumentId.value, {
      title: documentTitle.value,
      content,
    });
    isDirty.value = false;
    await loadDocuments();
  }

  async function deleteDocumentById(id: string) {
    await deleteDocument(id);
    if (activeDocumentId.value === id) {
      activeDocumentId.value = null;
      activeDocument.value = null;
      documentTitle.value = '未命名文档';
    }
    await loadDocuments();
  }

  function setTitle(title: string) {
    documentTitle.value = title;
  }

  return {
    editor,
    documents,
    activeDocumentId,
    activeDocument,
    documentTitle,
    isDirty,
    setEditor,
    loadDocuments,
    openDocument,
    newDocument,
    saveCurrentDocument,
    deleteDocumentById,
    setTitle,
  };
});
