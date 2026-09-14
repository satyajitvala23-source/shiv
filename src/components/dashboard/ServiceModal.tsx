import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check } from 'lucide-react';
import { ServiceItem } from '../../types';

interface ServiceModalProps {
  isOpen: boolean;
  serviceToEdit: ServiceItem | null;
  defaultCategory?: 'general' | 'agriculture';
  onClose: () => void;
  onSave: (service: Omit<ServiceItem, 'id'>) => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  serviceToEdit,
  defaultCategory = 'general',
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(serviceToEdit?.name || '');
  const [category, setCategory] = useState<'general' | 'agriculture'>(
    serviceToEdit?.category || defaultCategory
  );
  const [department, setDepartment] = useState(serviceToEdit?.department || 'Revenue Department');
  const [description, setDescription] = useState(serviceToEdit?.description || '');
  const [fee, setFee] = useState<number>(serviceToEdit?.fee || 150);
  const [processingTime, setProcessingTime] = useState(serviceToEdit?.processingTime || '3-5 Working Days');
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>(
    serviceToEdit?.requiredDocuments || ['Aadhaar Card', 'Ration Card']
  );
  const [newDocInput, setNewDocInput] = useState('');
  const [enabled, setEnabled] = useState(serviceToEdit ? serviceToEdit.enabled : true);

  useEffect(() => {
    if (serviceToEdit) {
      setName(serviceToEdit.name);
      setCategory(serviceToEdit.category);
      setDepartment(serviceToEdit.department);
      setDescription(serviceToEdit.description);
      setFee(serviceToEdit.fee);
      setProcessingTime(serviceToEdit.processingTime);
      setRequiredDocuments(serviceToEdit.requiredDocuments || ['Aadhaar Card', 'Ration Card']);
      setEnabled(serviceToEdit.enabled);
    } else {
      setName('');
      setCategory(defaultCategory);
      setDepartment('Revenue Department');
      setDescription('');
      setFee(150);
      setProcessingTime('3-5 Working Days');
      setRequiredDocuments(['Aadhaar Card', 'Ration Card']);
      setEnabled(true);
    }
  }, [serviceToEdit, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const handleAddDoc = () => {
    if (!newDocInput.trim()) return;
    setRequiredDocuments((prev) => [...prev, newDocInput.trim()]);
    setNewDocInput('');
  };

  const handleRemoveDoc = (index: number) => {
    setRequiredDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      category,
      department: department.trim(),
      description: description.trim(),
      fee: Number(fee) || 0,
      processingTime: processingTime.trim(),
      requiredDocuments,
      enabled,
    });
    onClose();
  };

  return (
    <div
      id="service-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        id="service-modal-card"
        className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-left animate-in zoom-in-95"
      >
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            {serviceToEdit ? 'Edit Service Details' : 'Add New Citizen Service'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Service Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Caste Certificate or Solar Pump Subsidy"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as 'general' | 'agriculture')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
              >
                <option value="general">General Citizen Service</option>
                <option value="agriculture">Agriculture / iKhedut Service</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Revenue Department"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Service Processing Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Processing Time
              </label>
              <input
                type="text"
                value={processingTime}
                onChange={(e) => setProcessingTime(e.target.value)}
                placeholder="e.g. 5-7 Working Days"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of requirements and eligibility"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Required Documents
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newDocInput}
                onChange={(e) => setNewDocInput(e.target.value)}
                placeholder="Add document (e.g. Land 7/12 Extract)"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
              />
              <button
                type="button"
                onClick={handleAddDoc}
                className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {requiredDocuments.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200/60 dark:border-slate-700"
                >
                  <span className="text-slate-700 dark:text-slate-300">{doc}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(idx)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Service Active / Enabled for Citizens
              </span>
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
              <span>Save Service</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
