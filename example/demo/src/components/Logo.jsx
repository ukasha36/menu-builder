import React from "react";

;

function Logo({ collapsed }) {
  return (
    <div
      style={{
        color: "white",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding,
        gap,
      }}
    >
      <img
        style={{
          width,
          height,
        }}
        src="/burger.png"
        alt=""
      />
      <p
        style={{
          fontSize,
          fontWeight: "bolder",
          display ? "none" : "block",
        }}
      >
        {collapsed ? null : "React DND Menu Builder"}
      </p>
    </div>
  );
}

export default Logo;
