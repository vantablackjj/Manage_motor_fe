import React from "react";
import Icon from "@ant-design/icons";

const MotorcycleSvg = () => (
  <svg
    viewBox="0 0 640 512"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M512 96c0-53-43-96-96-96s-96 43-96 96s43 96 96 96s96-43 96-96zM176 128a48 48 0 1 0 0 96 48 48 0 1 0 0-96zM464 208c-66.3 0-120 53.7-120 120s53.7 120 120 120s120-53.7 120-120s-53.7-120-120-120zM464 384c-30.9 0-56-25.1-56-56s25.1-56 56-56s56 25.1 56 56s-25.1 56-56 56zM80 328c0-66.3 53.7-120 120-120c15 0 29.2 2.7 42.4 7.7l13.5-33.8c-17.6-6.6-36.3-10-55.9-10C101.1 171.9 21 241.9 0 334.3C0 334.8 0 335.4 0 336c0 66.3 53.7 120 120 120c56.8 0 104.5-39.7 116.7-92.3L193.3 351c-2.4 23.3-22.1 41-45.3 41c-26.5 0-48-21.5-48-48c0-5.7 1-11.2 2.8-16zm466.7-101.4l-11.4-28.5c-4.4-10.9-14.8-18.1-26.5-18.1H292.1l-16 40h216.6c2.4 0 4.5 1.4 5.4 3.6l10.3 25.6c11.1-13.6 23.9-25.5 38.3-35.1z" />
  </svg>
);

const MotorcycleIcon = (props) => <Icon component={MotorcycleSvg} {...props} />;

export default MotorcycleIcon;
