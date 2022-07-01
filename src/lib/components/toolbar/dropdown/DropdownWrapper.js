import React from 'react'
import './wrapper.sass'

const DropdownWrapper = ({children}) => {
  return (
    <div className='dropdown__wrapper'>{children}</div>
  )
}

export default DropdownWrapper