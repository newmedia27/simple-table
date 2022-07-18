import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import ClassNames from "classnames";
import "./modal.module.sass";
import { useModal } from ".";

let modalRoot;
if (typeof document === "object") {
  modalRoot = document.createElement("div");
  modalRoot.setAttribute("class", 'ModalRoot');
  document.body.appendChild(modalRoot);
}

const ModalContent = ({ children, closingAnimate, className }) => {
  const { isOpen, close, disabled } = useModal();
  useEffect(() => {
    const handleKeyUp = (e) => {
      if (e.which === 27) {
        e.preventDefault();
        close();
      }
    };

    window.addEventListener("keyup", handleKeyUp, false);
    return () => {
      window.removeEventListener("keyup", handleKeyUp, false);
    };
  }, [close]);

  //   useEffect(() => {
  //     const { body } = document;
  //     if (isOpen) {
  //       body.style.overflow = "hidden";
  //     } else {
  //       body.style.overflow = "unset";
  //     }
  //   }, [isOpen]);

  if (!isOpen) return null;
  return createPortal(
    <div className="Root">
      <div
        className={ClassNames('Modal__overlay', {
         'Modal__overlay_closed': closingAnimate,
        })}
        onClick={() => close()}
      />
      <div
        className={ClassNames(
        'Modal__wrapper',
          {
            'Modal__wrapper_closed': closingAnimate,
          },
          className
        )}
      >
        <div className={"Modal"}>{children(close, disabled)}</div>
      </div>
    </div>,
    modalRoot
  );
};

ModalContent.proptypes = {
  children: PropTypes.node.isRequired,
  closingAnimate: PropTypes.bool,
};
ModalContent.defaultprops = {
  closingAnimate: false,
};

export default ModalContent;
