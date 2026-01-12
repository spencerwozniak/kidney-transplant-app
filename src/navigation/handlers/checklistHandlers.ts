/**
 * Checklist Flow Handlers
 * 
 * Handles navigation for the checklist management flow:
 * 1. ChecklistTimelineScreen -> ChecklistItemEditScreen
 * 2. ChecklistItemEditScreen -> ChecklistDocumentsScreen
 */

import type { UseAppStateReturn } from '../useAppState';

type ChecklistHandlers = {
  handleViewChecklist: () => void;
  handleEditChecklistItem: (itemId: string, item: any) => void;
  handleSaveChecklistItem: () => void;
  handleNavigateBackFromChecklistItem: () => void;
  handleRequestDocuments: () => void;
  handleNavigateBackFromDocuments: () => void;
};

export function createChecklistHandlers(
  state: UseAppStateReturn
): ChecklistHandlers {
  const {
    setCurrentScreen,
    setEditingChecklistItem,
    editingChecklistItem,
  } = state;

  const handleViewChecklist = () => {
    setCurrentScreen('checklist-timeline');
  };

  const handleEditChecklistItem = (itemId: string, item: any) => {
    setEditingChecklistItem({ itemId, item });
    setCurrentScreen('checklist-item-edit');
  };

  const handleSaveChecklistItem = () => {
    setEditingChecklistItem(null);
    setCurrentScreen('checklist-timeline');
  };

  const handleNavigateBackFromChecklistItem = () => {
    setEditingChecklistItem(null);
    setCurrentScreen('checklist-timeline');
  };

  const handleRequestDocuments = () => {
    // Preserve editingChecklistItem when navigating to documents screen
    setCurrentScreen('checklist-documents');
  };

  const handleNavigateBackFromDocuments = () => {
    setCurrentScreen('checklist-item-edit');
  };

  return {
    handleViewChecklist,
    handleEditChecklistItem,
    handleSaveChecklistItem,
    handleNavigateBackFromChecklistItem,
    handleRequestDocuments,
    handleNavigateBackFromDocuments,
  };
}

