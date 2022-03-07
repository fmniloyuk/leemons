import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Switch, ContextContainer } from '@bubbles-ui/components';

export default function ConditionalInput({
  showOnTrue = true,
  render,
  helpPosition = 'bottom',
  onChange,
  value: userValue,
  ...props
}) {
  const [show, setShow] = useState(userValue || false);

  const handleChange = (value) => {
    setShow(value);
    if (typeof onChange === 'function') {
      onChange(value);
    }
  };

  useEffect(() => {
    handleChange(userValue);
  }, [userValue]);

  return (
    <ContextContainer>
      <Switch {...props} helpPosition={helpPosition} value={show} onChange={handleChange} />
      {showOnTrue === show && render()}
    </ContextContainer>
  );
}

ConditionalInput.propTypes = {
  showOnTrue: PropTypes.bool,
  render: PropTypes.func,
  helpPosition: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.bool,
};
