import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

type Props = {};

export const GlobalDropzone: React.FC<Props> = () => {
  const onDrop = useCallback(acceptedFiles => {
    console.log('DDDDDDDDDDD', acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps({
        onClick: e => {
          e.stopPropagation();
        },
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        },
      })}
    >
      <input {...getInputProps()} />
    </div>
  );
};
