import React, { useEffect, useState } from 'react';
import Icon from '../../../atoms/icon';

const ScrollMessage = props => {
  const [message, setMessage] = useState(false);

  useEffect(() => {
    setMessage(true);
  }, [message]);

  const classes = [
    'message',
    message && 'show',
    props.scrollBottom && 'scroll-bottom',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div>Scroll for more <Icon name="arrow-down-sld" /></div>
    </div>
  );
};

export default ScrollMessage;
