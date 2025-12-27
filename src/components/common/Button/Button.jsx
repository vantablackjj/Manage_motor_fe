import React from "react";
import { Button as AntButton } from "antd";
import "./Button.css";

const Button = ({
  children,
  type = "default",
  size = "middle",
  icon,
  loading = false,
  disabled = false,
  block = false,
  danger = false,
  ghost = false,
  htmlType = "button",
  onClick,
  className = "",
  ...rest
}) => {
  return (
    <AntButton
      type={type}
      size={size}
      icon={icon}
      loading={loading}
      disabled={disabled}
      block={block}
      danger={danger}
      ghost={ghost}
      htmlType={htmlType}
      onClick={onClick}
      className={`custom-button ${className}`}
      {...rest}
    >
      {children}
    </AntButton>
  );
};

export default Button;
