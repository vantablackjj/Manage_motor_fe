import React, { useState } from "react";
import { Button, Tooltip } from "antd";
import { ImportOutlined } from "@ant-design/icons";
import ImportModal from "./ImportModal";

const ImportButton = ({ module, title, onSuccess, ...props }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title={`Import ${title || module}`}>
        <Button
          icon={<ImportOutlined />}
          onClick={() => setOpen(true)}
          {...props}
        >
          Import
        </Button>
      </Tooltip>

      <ImportModal
        open={open}
        onCancel={() => setOpen(false)}
        module={module}
        title={`Import ${title || module}`}
        onSuccess={(data) => {
          if (onSuccess) onSuccess(data);
          setOpen(false);
        }}
      />
    </>
  );
};

export default ImportButton;
