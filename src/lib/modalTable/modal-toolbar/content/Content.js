import React from "react";
import Icon from "../../../components/toolbar/icon";

const Content = props => {
  return (
    <ul>
      {props.list.map((item, index) => {
        const icon = item.display.icon ? <Icon name={item.display.icon} /> : null;
        const result = item.type || item.display.name;
        return (
          <li key={index} style={item.display.style} onClick={() => props.handleSubmit(result)}>
            {icon} {item.display.name}
          </li>
        );
      })}
    </ul>
  );
};

export default Content;
