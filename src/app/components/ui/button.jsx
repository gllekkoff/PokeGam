'use client';

import * as React from "react";
import styles from "./button.module.css";

const Button = React.forwardRef((props, ref) => {
  const {
    className,
    variant = "default",
    size = "default",
    ...otherProps
  } = props;

  const getClassName = () => {
    const classes = [
      styles.button,
      styles[variant],
      size === "default" ? styles["default-size"] : styles[size]
    ];
    
    if (className) {
      classes.push(className);
    }
    
    return classes.join(" ");
  };

  return (
    <button
      className={getClassName()}
      ref={ref}
      {...otherProps}
    />
  );
});

Button.displayName = "Button";

/**
 * Available variants: "default", "destructive", "outline", "secondary", "ghost", "link"
 * Available sizes: "default", "sm", "lg", "icon"
 */
export { Button };