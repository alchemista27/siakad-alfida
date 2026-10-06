'use client';

import React, { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Button } from './button';
import { Icon } from './icon';

interface CloudinaryUploadProps {
  onUploadSuccess: (secureUrl: string) => void;
  className?: string;
  buttonText?: string;
}

export function CloudinaryUpload({ onUploadSuccess, className, buttonText = 'Upload File' }: CloudinaryUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <CldUploadWidget 
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "alfida_default"}
      options={{
        multiple: false,
        resourceType: "auto", // Menerima images, docs, pdfs, dll
        clientAllowedFormats: ["png", "jpg", "jpeg", "pdf", "doc", "docx", "xls", "xlsx", "zip"],
        maxFileSize: 10485760 // 10MB
      }}
      onSuccess={(result: any) => {
        if (result.info && result.info.secure_url) {
          setFileName(result.info.original_filename + '.' + result.info.format);
          onUploadSuccess(result.info.secure_url);
        }
      }}
    >
      {({ open }) => (
        <div className="flex flex-col gap-2 items-start">
          <Button 
            type="button" 
            variant="secondary" 
            className={className} 
            onClick={() => open()}
          >
            <Icon name="cloud_upload" className="mr-2" />
            {fileName ? 'Ganti File' : buttonText}
          </Button>
          {fileName && (
            <div className="text-xs text-[#0f7f6d] flex items-center bg-[#0f7f6d]/10 px-2 py-1 rounded">
              <Icon name="check_circle" className="text-sm mr-1" /> 
              {fileName} (Berhasil diunggah)
            </div>
          )}
        </div>
      )}
    </CldUploadWidget>
  );
}
