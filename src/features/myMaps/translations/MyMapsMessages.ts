import type { JSX } from 'react';

export type MyMapsMessages = {
  addNew: string;
  noMapFound: string;
  save: string;
  disconnect: string;
  disconnectAndClear: string;
  deleteConfirm: (name: string) => JSX.Element;
  deleteTitle: string;
  fetchError: (props: { err: unknown }) => string;
  fetchListError: (props: { err: unknown }) => string;
  deleteError: (props: { err: unknown }) => string;
  saveError: (props: { err: unknown }) => string;
  loadToEmpty: string;
  loadInclMapAndPosition: string;
  writers: string;
  addWriter: string;
  conflictError: string;
};
