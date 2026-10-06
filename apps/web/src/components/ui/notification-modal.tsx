import React from 'react';
import { Modal } from './modal';
import { Button } from './button';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

export function NotificationModal({ isOpen, onClose, title, message, type = 'info' }: NotificationModalProps) {
  let headerColor = 'text-primary';
  let buttonVariant: 'primary' | 'secondary' | 'danger' = 'primary';

  if (type === 'success') {
    headerColor = 'text-[#06bfa2]'; // Secondary color from DESIGN.md
    buttonVariant = 'primary';
  } else if (type === 'error') {
    headerColor = 'text-red-600';
    buttonVariant = 'danger';
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={<span className={headerColor}>{title}</span>}>
      <div className="p-4 flex flex-col gap-6">
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{message}</p>
        <div className="flex justify-end">
          <Button onClick={onClose} variant={buttonVariant}>
            Mengerti
          </Button>
        </div>
      </div>
    </Modal>
  );
}
