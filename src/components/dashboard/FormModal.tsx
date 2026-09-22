import React, { useState, useEffect } from 'react';
import { X, Check, FileUp } from 'lucide-react';
import { FormTemplate } from '../../types';

interface FormModalProps {
  isOpen: boolean;
  formToEdit: FormTemplate | null;
  onClose: () => void;
  onSave: (form: Omit<FormTemplate, 'id' | 'downloadCount' | 'lastUpdated'>) => void;
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  formToEdit,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(formToEdit?.title || '');
  const [category, setCategory] = useState<'general' | 'agriculture' | 'revenue' | 'panchayat'>(
    formToEdit?.category || 'general'
  );
  const [description, setDescription] = useState(formToEdit?.description || '');
  const [fileSize, setFileSize] = useState(formToEdit?.fileSize || '650 KB');
  const [fileType, setFileType] = useState(formToEdit?.fileType || 'PDF Document');
  const [enabled, setEnabled] = useState(formToEdit ? formToEdit.enabled : true);

  useEffect(() => {
    if (formToEdit) {
      setTitle(formToEdit.title);
      setCategory(formToEdit.category);
      setDescription(formToEdit.description);
      setFileSize(formToEdit.fileSize);
      setFileType(formToEdit.fileType);
      setEnabled(formToEdit.enabled);
    } else {
      setTitle('');
      setCategory('general');
      setDescription('');
      setFileSize('650 KB');
      setFileType('PDF Document');
      setEnabled(true);
    }
  }, [formToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      category,
      description: description.trim(),
      fileSize,
      fileType,
      enabled,
    });
    onClose();
  };

  return (
    <div
      id="form-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        id="form-modal-card"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-left animate-in zoom-in-95"
      >
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            {formToEdit ? 'Edit Form Template' : 'Add New Downloadable Form'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Form Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter form title"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            >
              <option value="general">General Application Form</option>
              <option value="agriculture">Agriculture & iKhedut Scheme</option>
              <option value="revenue">Revenue & Mamlatdar Office</option>
              <option value="panchayat">Panchayat & Ration Card</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Instructions
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Guidelines for applicants when filling this form"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                File Size
              </label>
              <input
                type="text"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                placeholder="File size (KB / MB)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                File Format
              </label>
              <input
                type="text"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                placeholder="PDF Document"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 text-slate-500 text-xs">
            <FileUp className="w-4 h-4 text-blue-500" />
            <span>Simulate file upload / replacement on submit</span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="form-active-check"
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="form-active-check" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              Active / Available for Download
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Form</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
